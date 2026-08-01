import { createResource, createSignal, Show } from "solid-js"
import type { BduiAction, BduiPage } from "@infra/types/bdui"
import { usePlatform } from "@/context/platform"
import { applyBduiActionResponse, dispatchBduiAction, loadBduiPage } from "./controller"
import { BduiPageView } from "./renderer"
import "./styles.css"

export function BduiPage(props: { basePath: string; pageId: string }) {
  const platform = usePlatform()
  const fetcher = platform.fetch ?? globalThis.fetch
  const [state, setState] = createSignal<Record<string, unknown>>({})

  const [page, { refetch }] = createResource(
    () => `${props.basePath}|${props.pageId}`,
    async (): Promise<BduiPage> => {
      const page = await loadBduiPage({ basePath: props.basePath, pageId: props.pageId }, fetcher)
      setState({ ...(page.state ?? page.context ?? {}) })
      return page
    },
  )

  const onAction = async (action: BduiAction) => {
    const current = page()
    if (!current) return
    if (action.type === "dispatch" && action.event === "reload") {
      refetch()
      return
    }
    try {
      const response = await dispatchBduiAction(
        props.basePath,
        {
          pageId: props.pageId,
          action,
          state: state(),
        },
        fetcher,
      )
      const result = applyBduiActionResponse(state(), response)
      if (result.navigate) {
        console.warn("BDUI navigate unsupported in desktop:", result.navigate)
      }
      setState(result.state)
    } catch (err) {
      console.warn("BDUI action failed:", err)
    }
  }

  return (
    <Show
      when={!page.error && page()}
      fallback={
        <div class="bdui-placeholder">
          {page.error ? "Failed to load BDUI page" : "Loading BDUI page…"}
        </div>
      }
    >
      {(p) => <BduiPageView page={p} state={state()} onAction={(action) => void onAction(action)} />}
    </Show>
  )
}
