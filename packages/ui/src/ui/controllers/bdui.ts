import type { BduiPage, BduiAction, BduiActionResponse } from "../../../../infra/src/types/bdui.js"

type BduiPageParams = {
  basePath: string
  pageId: string
}

type BduiActionPayload = {
  pageId: string
  action: BduiAction
  state: Record<string, unknown>
}

export type BduiPageState = {
  loading: boolean
  page: BduiPage | null
  error: string | null
  pageState: Record<string, unknown>
}

function normalizeBasePath(basePath: string): string {
  return basePath.replace(/\/+$/, "")
}

async function fetchWithAuth(url: string): Promise<Response> {
  return fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "same-origin",
  })
}

export async function loadBduiPage(params: BduiPageParams): Promise<BduiPage> {
  const basePath = normalizeBasePath(params.basePath)
  const url = basePath
    ? `${basePath}/ui/page/${encodeURIComponent(params.pageId)}`
    : `/ui/page/${encodeURIComponent(params.pageId)}`

  const res = await fetchWithAuth(url)
  if (!res.ok) {
    throw new Error(`Failed to load BDUI page: ${res.status} ${res.statusText}`)
  }

  const page = (await res.json()) as BduiPage

  if (page.schema !== "bdui/v1") {
    throw new Error(`Unknown BDUI schema version: ${page.schema}`)
  }

  return page
}

export async function loadBduiRegistry(basePath: string): Promise<Record<string, unknown>> {
  const normalized = normalizeBasePath(basePath)
  const url = normalized ? `${normalized}/ui/registry` : "/ui/registry"

  const res = await fetchWithAuth(url)
  if (!res.ok) {
    throw new Error(`Failed to load BDUI registry: ${res.status}`)
  }

  return res.json() as Promise<Record<string, unknown>>
}

export async function dispatchBduiAction(
  basePath: string,
  payload: BduiActionPayload,
): Promise<BduiActionResponse> {
  const normalized = normalizeBasePath(basePath)
  const url = normalized ? `${normalized}/ui/action` : "/ui/action"

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "same-origin",
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
): Record<string, unknown> {
  if (response.navigate && typeof window !== "undefined") {
    window.location.href = response.navigate.startsWith("/")
      ? `${normalizeBasePath("")}${response.navigate}`
      : response.navigate
    return state
  }
  if (response.state) {
    return { ...state, ...response.state }
  }
  if (response.patch) {
    let next = state
    for (const p of response.patch) {
      next = applyPatch(next, p)
    }
    return next
  }
  return state
}

export async function initBduiPage(
  params: BduiPageParams & { signal?: AbortSignal },
): Promise<BduiPageState> {
  try {
    const page = await loadBduiPage(params)
    return {
      loading: false,
      page,
      error: null,
      pageState: { ...(page.state ?? page.context ?? {}) },
    }
  } catch (err) {
    return {
      loading: false,
      page: null,
      error: err instanceof Error ? err.message : "Unknown error",
      pageState: {},
    }
  }
}
