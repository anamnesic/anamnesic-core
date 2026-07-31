import type {
  BduiAction,
  BduiActionResponse,
  BduiComponentRegistration,
  BduiPage,
  BduiPageEntry,
} from "@infra/types/bdui"

type BduiPageParams = {
  basePath: string
  pageId: string
}

type BduiActionPayload = {
  pageId: string
  action: BduiAction
  state: Record<string, unknown>
}

export type BduiRegistry = {
  pages?: BduiPageEntry[]
  components: BduiComponentRegistration[]
}

export type BduiApplyResult = {
  state: Record<string, unknown>
  navigate?: string
}

function normalizeBasePath(basePath: string): string {
  return basePath.replace(/\/+$/, "")
}

export async function loadBduiRegistry(
  basePath: string,
  fetcher: typeof fetch = globalThis.fetch,
): Promise<BduiRegistry> {
  const normalized = normalizeBasePath(basePath)
  const url = normalized ? `${normalized}/ui/registry` : "/ui/registry"

  const res = await fetcher(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  })
  if (!res.ok) {
    throw new Error(`Failed to load BDUI registry: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<BduiRegistry>
}

export async function loadBduiPage(
  params: BduiPageParams,
  fetcher: typeof fetch = globalThis.fetch,
): Promise<BduiPage> {
  const basePath = normalizeBasePath(params.basePath)
  const url = basePath
    ? `${basePath}/ui/page/${encodeURIComponent(params.pageId)}`
    : `/ui/page/${encodeURIComponent(params.pageId)}`

  const res = await fetcher(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  })
  if (!res.ok) {
    throw new Error(`Failed to load BDUI page: ${res.status} ${res.statusText}`)
  }

  const page = (await res.json()) as BduiPage
  if (page.schema !== "bdui/v1") {
    throw new Error(`Unknown BDUI schema version: ${page.schema}`)
  }

  return page
}

export async function dispatchBduiAction(
  basePath: string,
  payload: BduiActionPayload,
  fetcher: typeof fetch = globalThis.fetch,
): Promise<BduiActionResponse> {
  const normalized = normalizeBasePath(basePath)
  const url = normalized ? `${normalized}/ui/action` : "/ui/action"

  const res = await fetcher(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`BDUI action failed: ${res.status}`)
  }

  return res.json() as Promise<BduiActionResponse>
}

function applyPatch(
  state: Record<string, unknown>,
  patch: { op: "replace" | "remove" | "add"; path: string; value?: unknown },
): Record<string, unknown> {
  const next = { ...state }
  const parts = patch.path.split(".")
  const key = parts[parts.length - 1]
  let target: unknown = next
  for (let i = 0; i < parts.length - 1; i++) {
    const segment = (target as Record<string, unknown>)[parts[i]]
    target = segment && typeof segment === "object" ? segment : {}
  }
  if (patch.op === "remove" || patch.value === undefined) {
    delete (target as Record<string, unknown>)[key]
  } else {
    (target as Record<string, unknown>)[key] = patch.value
  }
  return next
}

export function applyBduiActionResponse(
  state: Record<string, unknown>,
  response: BduiActionResponse,
): BduiApplyResult {
  if (response.navigate) {
    return { state, navigate: response.navigate }
  }
  if (response.state) {
    return { state: { ...state, ...response.state } }
  }
  if (response.patch) {
    let next = state
    for (const p of response.patch) {
      next = applyPatch(next, p)
    }
    return { state: next }
  }
  return { state }
}
