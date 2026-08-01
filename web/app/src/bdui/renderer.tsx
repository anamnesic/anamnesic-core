import type { JSX } from "solid-js"
import type {
  BduiAction,
  BduiComponent,
  BduiCondition,
  BduiDataExpression,
  BduiPage,
  BduiStyle,
} from "@infra/types/bdui"

export type BduiRenderContext = {
  state: Record<string, unknown>
  data: Record<string, unknown>
  onAction: (action: BduiAction) => void
}

export type BduiRenderProps = {
  page: BduiPage
  state?: Record<string, unknown>
  onAction?: (action: BduiAction) => void
}

function resolveExpression(expr: BduiDataExpression, ctx: BduiRenderContext): unknown {
  const parts = expr.path.split(".")
  let value: unknown = ctx.state
  for (const part of parts) {
    if (value && typeof value === "object") {
      value = (value as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return value
}

function resolveCondition(conditions: BduiCondition | undefined, ctx: BduiRenderContext): boolean {
  if (!conditions?.show) return true
  return Boolean(resolveExpression(conditions.show, ctx))
}

function buildStyle(style: BduiStyle | undefined): JSX.CSSProperties {
  if (!style) return {}
  const s: Record<string, string> = {}
  if (style.flex !== undefined) s.display = "flex"
  if (style.width) s.width = style.width
  if (style.height) s.height = style.height
  if (style.padding) s.padding = style.padding
  if (style.margin) s.margin = style.margin
  if (style.gap) s.gap = style.gap
  if (style.align) s.alignItems = style.align
  if (style.justify) s.justifyContent = style.justify
  return s as JSX.CSSProperties
}

function wrapAction(handler: BduiAction | undefined, ctx: BduiRenderContext): ((e: Event) => void) | undefined {
  if (!handler) return undefined
  return (e: Event) => {
    e.preventDefault()
    ctx.onAction(handler)
  }
}

function combinedClass(extra: string, base: string | undefined): string {
  return base ? `${extra} ${base}` : extra
}

function renderChildren(children: BduiComponent[] | undefined, ctx: BduiRenderContext): JSX.Element {
  if (!children || children.length === 0) return undefined
  return children
    .filter((child) => resolveCondition(child.conditions, ctx))
    .map((child) => renderComponent(child, ctx))
}

function renderComponent(component: BduiComponent, ctx: BduiRenderContext): JSX.Element {
  const base = {
    "data-key": component.key,
    style: buildStyle(component.style),
    class: component.style?.class,
  }

  switch (component.type) {
    case "text":
      return (
        <span {...base}>
          {String(component.props?.content ?? "")}
          {renderChildren(component.children, ctx)}
        </span>
      )

    case "heading":
      return <h2 {...base}>{String(component.props?.content ?? "")}</h2>

    case "badge":
      return (
        <span {...base} class={combinedClass("badge", component.style?.class)}>
          {String(component.props?.content ?? "")}
        </span>
      )

    case "button":
      return (
        <button
          {...base}
          class={combinedClass("bdui-button", component.style?.class)}
          onClick={wrapAction(component.actions?.onClick, ctx)}
          disabled={!resolveCondition(component.conditions, ctx)}
        >
          {String(component.props?.label ?? "Button")}
        </button>
      )

    case "input":
      return (
        <input
          {...base}
          type={String(component.props?.type ?? "text")}
          placeholder={String(component.props?.placeholder ?? "")}
          value={String(component.props?.value ?? "")}
          onChange={wrapAction(component.actions?.onChange, ctx)}
        />
      )

    case "select":
      return (
        <select {...base} onChange={wrapAction(component.actions?.onChange, ctx)}>
          {((component.props?.options ?? []) as Array<{ label: string; value: string }>).map((opt) => (
            <option value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )

    case "checkbox":
      return (
        <label {...base}>
          <input
            type="checkbox"
            checked={!!component.props?.checked}
            onChange={wrapAction(component.actions?.onChange, ctx)}
          />
          {String(component.props?.label ?? "")}
        </label>
      )

    case "toggle":
      return (
        <label {...base} class={combinedClass("bdui-toggle", component.style?.class)}>
          <input
            type="checkbox"
            role="switch"
            checked={!!component.props?.checked}
            onChange={wrapAction(component.actions?.onChange, ctx)}
          />
          {String(component.props?.label ?? "")}
        </label>
      )

    case "textarea":
      return (
        <textarea
          {...base}
          placeholder={String(component.props?.placeholder ?? "")}
          onChange={wrapAction(component.actions?.onChange, ctx)}
        >
          {String(component.props?.value ?? "")}
        </textarea>
      )

    case "card":
      return (
        <div {...base} class={combinedClass("card", component.style?.class)} onClick={wrapAction(component.actions?.onClick, ctx)}>
          {component.props?.title ? <h3>{String(component.props.title)}</h3> : undefined}
          {renderChildren(component.children, ctx)}
        </div>
      )

    case "table": {
      const columns = (component.props?.columns ?? []) as Array<{ key: string; label: string }>
      const rows = (component.props?.rows ?? []) as Array<Record<string, unknown>>
      return (
        <table {...base}>
          <thead>
            <tr>{columns.map((col) => <th>{col.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr>{columns.map((col) => <td>{String(row[col.key] ?? "")}</td>)}</tr>
            ))}
          </tbody>
        </table>
      )
    }

    case "stack":
    case "row":
      return <div {...base}>{renderChildren(component.children, ctx)}</div>

    case "separator":
      return <hr {...base} />

    case "spinner":
      return (
        <div {...base} class={combinedClass("spinner", component.style?.class)}>
          <div class="spinner__dot" />
          <div class="spinner__dot" />
          <div class="spinner__dot" />
        </div>
      )

    case "metric":
      return (
        <div {...base} class={combinedClass("metric", component.style?.class)}>
          <span class="metric__value">{String(component.props?.value ?? "")}</span>
          <span class="metric__label">{String(component.props?.label ?? "")}</span>
        </div>
      )

    case "image":
      return (
        <img {...base} src={String(component.props?.src ?? "")} alt={String(component.props?.alt ?? "")} />
      )

    case "avatar":
      return (
        <img
          {...base}
          class={combinedClass("avatar", component.style?.class)}
          src={String(component.props?.src ?? "")}
          alt={String(component.props?.alt ?? "")}
        />
      )

    case "link":
      return (
        <a
          {...base}
          href={String(component.props?.href ?? "#")}
          target={component.props?.external ? "_blank" : undefined}
          onClick={wrapAction(component.actions?.onClick, ctx)}
        >
          {String(component.props?.content ?? "")}
          {renderChildren(component.children, ctx)}
        </a>
      )

    case "tabs": {
      const tabs = (component.props?.tabs ?? []) as Array<{ id: string; label: string }>
      return (
        <div {...base} class={combinedClass("tabs", component.style?.class)}>
          <nav class="tabs__nav">
            {tabs.map((tab) => (
              <button
                class="tabs__tab"
                onClick={() => ctx.onAction({ type: "dispatch", event: "tab.select", payload: { tabId: tab.id } })}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div class="tabs__content">{renderChildren(component.children, ctx)}</div>
        </div>
      )
    }

    case "form":
      return (
        <form {...base} onSubmit={wrapAction(component.actions?.onSubmit, ctx)}>
          {renderChildren(component.children, ctx)}
          {component.props?.submitLabel ? <button type="submit">{String(component.props.submitLabel)}</button> : undefined}
        </form>
      )

    case "container":
      return <div {...base}>{renderChildren(component.children, ctx)}</div>

    default:
      return (
        <div {...base} data-bdui-type={component.type}>
          {renderChildren(component.children, ctx)}
        </div>
      )
  }
}

export function BduiPageView(props: BduiRenderProps): JSX.Element {
  const ctx: BduiRenderContext = {
    state: props.state ?? props.page.state ?? props.page.context ?? {},
    data: {},
    onAction: props.onAction ?? ((action) => console.warn("BDUI action unhandled:", action.type)),
  }

  const layout = props.page.layout
  const breadcrumbs = layout.navigation?.breadcrumbs

  return (
    <div class={`bdui-layout bdui-layout--${layout.type}`}>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav class="bdui-breadcrumbs">
          {breadcrumbs.map((crumb, i) => (
            <span class="bdui-breadcrumbs__item">
              {crumb.route ? (
                <a
                  href={crumb.route}
                  onClick={(e: Event) => {
                    e.preventDefault()
                    ctx.onAction({ type: "navigate", route: crumb.route ?? "" })
                  }}
                >
                  {crumb.label}
                </a>
              ) : (
                <span>{crumb.label}</span>
              )}
              {i < breadcrumbs.length - 1 ? <span class="bdui-breadcrumbs__sep">/</span> : undefined}
            </span>
          ))}
        </nav>
      ) : undefined}

      {layout.icon ? <span class="bdui-layout__icon">{layout.icon}</span> : undefined}
      {layout.title ? <h1 class="bdui-layout__title">{layout.title}</h1> : undefined}
      {layout.subtitle ? <p class="bdui-layout__subtitle">{layout.subtitle}</p> : undefined}

      <div class="bdui-layout__body">{renderChildren(layout.children, ctx)}</div>
    </div>
  )
}
