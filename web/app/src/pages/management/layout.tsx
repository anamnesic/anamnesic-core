import { createResource, For, type ParentProps } from "solid-js"
import { A, useLocation } from "@solidjs/router"
import { useServer } from "@/context/server"
import { loadBduiRegistry } from "@/bdui/controller"

export default function ManagementLayout(props: ParentProps) {
  const loc = useLocation()
  const server = useServer()
  const [registry] = createResource(() => loadBduiRegistry(server.current?.http.url ?? ""))

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--background-base)", color: "var(--text-base)", overflow: "hidden" }}>
      <nav
        style={{
          width: "220px",
          background: "var(--surface-raised-base, var(--surface-base))",
          borderRight: "1px solid var(--border-base)",
          display: "flex",
          flexDirection: "column",
          padding: "16px 8px",
          gap: "4px",
          "overflow-y": "auto",
          "flex-shrink": "0",
        }}
      >
        <div
          style={{
            padding: "0 8px 16px",
            fontSize: "13px",
            fontWeight: "700",
            color: "var(--text-base)",
            "letter-spacing": "0.1em",
            "text-transform": "uppercase",
          }}
        >
          Control
        </div>
        <For each={registry()?.pages ?? []}>
          {(page) => {
            const href = `/control/${page.id}`
            const active = () => loc.pathname === href || loc.pathname.startsWith(href + "/")
            return (
              <A
                href={href}
                style={{
                  display: "flex",
                  "align-items": "center",
                  gap: "8px",
                  padding: "8px 10px",
                  "border-radius": "6px",
                  "font-size": "14px",
                  "text-decoration": "none",
                  color: active() ? "var(--text-base)" : "var(--text-weak)",
                  background: active() ? "var(--surface-base)" : "transparent",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {page.label}
              </A>
            )
          }}
        </For>
        <div style={{ "margin-top": "auto", "padding-top": "16px" }}>
          <A
            href="/"
            style={{
              display: "flex",
              "align-items": "center",
              gap: "8px",
              padding: "8px 10px",
              "border-radius": "6px",
              "font-size": "13px",
              color: "var(--text-weak)",
              "text-decoration": "none",
            }}
          >
            ← Back to App
          </A>
        </div>
      </nav>
      <main style={{ flex: "1", "overflow-y": "auto", padding: "32px 40px" }}>{props.children}</main>
    </div>
  )
}
