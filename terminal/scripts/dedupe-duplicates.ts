#!/usr/bin/env bun

import fs from "fs"
import path from "path"
import { createHash } from "crypto"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const defaultRoot = path.resolve(__dirname, "..")

const args = process.argv.slice(2)
const flagValue = (name: string) => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}

const root = path.resolve(flagValue("--root") ?? defaultRoot)
const apply = args.includes("--apply")
const force = args.includes("--force")
const exts = new Set(
  (flagValue("--exts") ?? "ts,tsx,js,jsx,mjs,cjs,mts,cts")
    .split(",")
    .map((s) => s.trim().replace(/^\./, ""))
    .filter(Boolean),
)
const excludedDirs = new Set(
  (flagValue("--exclude") ?? "node_modules,.git,dist,out,build,.turbo,.cache,coverage,target,.sst,.wrangler,.next,.svelte-kit")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
)

const toSlash = (p: string) => p.split(path.sep).join("/")
const stripExt = (p: string) => p.replace(/\.[^/.]+$/, "")
const rel = (p: string) => toSlash(path.relative(root, p))

const scanFiles = async (dir: string, out: string[] = []): Promise<string[]> => {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (excludedDirs.has(entry.name)) continue
      await scanFiles(path.join(dir, entry.name), out)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).slice(1).toLowerCase()
      if (exts.has(ext)) out.push(path.join(dir, entry.name))
    }
  }
  return out
}

const resolveSpecifier = (fromFile: string, spec: string): string[] => {
  let target = spec
  if (target.startsWith("@/")) target = path.join(root, "src", target.slice(2))
  else if (target.startsWith("@infra/")) target = path.join(root, "packages/infra/src", target.slice("@infra/".length))
  else if (target.startsWith("@kairos/")) target = path.join(root, "src", target.slice("@kairos/".length))
  if (target.startsWith(".")) target = path.resolve(path.dirname(fromFile), target)
  const base = stripExt(target)
  return [base, path.join(base, "index"), target]
}

const collectSpecifiers = async (files: string[]) => {
  const resolved = new Set<string>()
  const bare = new Set<string>()
  const specPattern =
    /(?:from\s+|import\s*\(\s*|import\s+|require\s*\(\s*|@import\s+["']|reference\s+path=["'])\s*["']([^"']+)["']/g
  const stringSpecPattern = /(["'])((?:\.\.?\/|@\/|@infra\/|@kairos\/)[^"']+)\1/g
  for (const file of files) {
    let text: string
    try {
      text = await fs.promises.readFile(file, "utf8")
    } catch {
      continue
    }
    for (const match of text.matchAll(specPattern)) {
      const spec = match[1]
      if (spec.startsWith(".") || spec.startsWith("@/") || spec.startsWith("@infra/") || spec.startsWith("@kairos/")) {
        for (const resolvedPath of resolveSpecifier(file, spec)) {
          if (resolvedPath.startsWith(root)) resolved.add(toSlash(resolvedPath))
        }
      } else {
        bare.add(stripExt(spec))
      }
    }
    for (const match of text.matchAll(stringSpecPattern)) {
      const spec = match[2]
      for (const resolvedPath of resolveSpecifier(file, spec)) {
        if (resolvedPath.startsWith(root)) resolved.add(toSlash(resolvedPath))
      }
    }
  }
  return { resolved, bare }
}

const main = async () => {
  console.log(`Scanning ${root} ...`)
  const files = await scanFiles(root)
  console.log(`Found ${files.length} files (${[...exts].join(",")})`)

  const byName = new Map<string, Map<string, string[]>>()
  const hashCache = new Map<string, string>()
  const sizeCache = new Map<string, number>()

  const hashOf = async (file: string) => {
    const cached = hashCache.get(file)
    if (cached) return cached
    const content = await fs.promises.readFile(file, "utf8")
    const hash = createHash("sha256").update(content).digest("hex")
    hashCache.set(file, hash)
    sizeCache.set(file, Buffer.byteLength(content, "utf8"))
    return hash
  }

  for (const file of files) {
    const name = path.basename(file)
    let hashes = byName.get(name)
    if (!hashes) {
      hashes = new Map()
      byName.set(name, hashes)
    }
    const hash = await hashOf(file)
    const same = hashes.get(hash)
    if (same) same.push(file)
    else hashes.set(hash, [file])
  }

  const { resolved, bare } = await collectSpecifiers(files)

  const isReferenced = (file: string) => {
    const noExt = toSlash(stripExt(file))
    if (resolved.has(noExt) || resolved.has(`${noExt}/index`)) return true
    return bare.has(stripExt(path.basename(file)))
  }

  const groups: Array<{
    name: string
    hash: string
    keeper: string
    dupes: Array<{ file: string; referenced: boolean; size: number }>
  }> = []

  let totalDupes = 0
  let totalBytes = 0

  for (const [name, hashes] of byName) {
    for (const [hash, filesInGroup] of hashes) {
      if (filesInGroup.length < 2) continue
      filesInGroup.sort((a, b) => {
        const ra = rel(a)
        const rb = rel(b)
        return ra.length - rb.length || (ra < rb ? -1 : ra > rb ? 1 : 0)
      })
      const keeper = filesInGroup[0]
      const dupes = filesInGroup.slice(1).map((file) => ({
        file,
        referenced: isReferenced(file),
        size: sizeCache.get(file) ?? 0,
      }))
      totalDupes += dupes.length
      totalBytes += dupes.reduce((sum, d) => sum + d.size, 0)
      groups.push({ name, hash, keeper, dupes })
    }
  }

  console.log(
    `Found ${groups.length} duplicate groups, ${totalDupes} files to delete, ${(totalBytes / 1024).toFixed(1)} KiB\n`,
  )

  let deleted = 0
  let skippedReferenced = 0
  let deletedBytes = 0

  for (const group of groups) {
    const action = `${apply ? "delete" : "would delete"}`
    console.log(`[${group.name}] ${group.hash.slice(0, 12)} (${group.dupes.length + 1}x)`)
    console.log(`  keep: ${rel(group.keeper)}`)
    for (const dupe of group.dupes) {
      const referenced = force ? "referenced (forced)" : dupe.referenced ? "referenced" : ""
      const note = referenced ? `  [${referenced}]` : ""
      if (apply && (force || !dupe.referenced)) {
        await fs.promises.unlink(dupe.file).catch(() => undefined)
        deleted++
        deletedBytes += dupe.size
        console.log(`  ${action}: ${rel(dupe.file)}${note}`)
      } else if (dupe.referenced) {
        skippedReferenced++
        console.log(`  skip:  ${rel(dupe.file)}${note}`)
      } else {
        console.log(`  ${action}: ${rel(dupe.file)}`)
      }
    }
    console.log("")
  }

  if (apply) {
    console.log(`Done: deleted ${deleted} files (${(deletedBytes / 1024).toFixed(1)} KiB)`)
  } else {
    console.log(`Dry run: nothing deleted. Re-run with --apply to delete.`)
  }
  if (skippedReferenced > 0 && !force) {
    console.log(
      `${skippedReferenced} duplicate(s) are still imported by other files and were kept. Use --force to delete them anyway.`,
    )
  }
}

await main()
