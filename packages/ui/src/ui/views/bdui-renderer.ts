import { html, nothing, type TemplateResult } from "lit";
import type {
  BduiComponent,
  BduiPage,
  BduiAction,
  BduiStyle,
  BduiCondition,
  BduiDataExpression,
} from "../../../../infra/src/types/bdui.js";

type BduiRendererContext = {
  state: Record<string, unknown>;
  data: Record<string, unknown>;
  onAction: (action: BduiAction) => void;
};

function resolveExpression(expr: BduiDataExpression, ctx: BduiRendererContext): unknown {
  const source = ctx.state;
  const parts = expr.path.split(".");
  let value: unknown = source;
  for (const part of parts) {
    if (value && typeof value === "object") {
      value = (value as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return value;
}

function resolveCondition(conditions: BduiCondition | undefined, ctx: BduiRendererContext): boolean {
  if (!conditions?.show) return true;
  return Boolean(resolveExpression(conditions.show, ctx));
}

function buildStyle(style: BduiStyle | undefined): Record<string, string> {
  if (!style) return {};
  const s: Record<string, string> = {};
  if (style.flex !== undefined) s.display = "flex";
  if (style.width) s.width = style.width;
  if (style.height) s.height = style.height;
  if (style.padding) s.padding = style.padding;
  if (style.margin) s.margin = style.margin;
  if (style.gap) s.gap = style.gap;
  if (style.align) s.alignItems = style.align;
  if (style.justify) s.justifyContent = style.justify;
  if (style.class) s.class = style.class;
  return s;
}

function wrapAction(handler: BduiAction | undefined, ctx: BduiRendererContext): ((e: Event) => void) | undefined {
  if (!handler) return undefined;
  return (e: Event) => {
    e.preventDefault();
    ctx.onAction(handler);
  };
}

function renderChildren(children: BduiComponent[] | undefined, ctx: BduiRendererContext): TemplateResult | undefined {
  if (!children || children.length === 0) return undefined;
  const results = children
    .filter((child) => resolveCondition(child.conditions, ctx))
    .map((child) => renderComponent(child, ctx));
  return html`${results}`;
}

function renderComponent(component: BduiComponent, ctx: BduiRendererContext): TemplateResult {
  const style = buildStyle(component.style);
  const styleAttr = Object.entries(style)
    .filter(([k]) => k !== "class")
    .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${v}`)
    .join("; ");

  const baseAttrs = {
    key: component.key,
    style: styleAttr || undefined,
    class: style.class || undefined,
  };

  switch (component.type) {
    case "text":
      return html`<span ...=${baseAttrs}>${String(component.props?.content ?? "")}${renderChildren(component.children, ctx)}</span>`;

    case "heading":
      return html`<h2 ...=${baseAttrs}>${String(component.props?.content ?? "")}</h2>`;

    case "badge":
      return html`<span class="badge" ...=${baseAttrs}>${String(component.props?.content ?? "")}</span>`;

    case "button":
      return html`
        <button
          ...=${baseAttrs}
          @click=${wrapAction(component.actions?.onClick, ctx)}
          ?disabled=${resolveCondition(component.conditions, ctx) === false}
        >
          ${String(component.props?.label ?? "Button")}
        </button>`;

    case "input":
      return html`
        <input
          ...=${baseAttrs}
          type=${String(component.props?.type ?? "text")}
          placeholder=${String(component.props?.placeholder ?? "")}
          value=${String(component.props?.value ?? "")}
          @change=${wrapAction(component.actions?.onChange, ctx)}
        />`;

    case "select":
      return html`
        <select
          ...=${baseAttrs}
          @change=${wrapAction(component.actions?.onChange, ctx)}
        >
          ${((component.props?.options ?? []) as Array<{ label: string; value: string }>).map(
            (opt) => html`<option value=${opt.value}>${opt.label}</option>`,
          )}
        </select>`;

    case "checkbox":
      return html`
        <label ...=${baseAttrs}>
          <input
            type="checkbox"
            ?checked=${!!component.props?.checked}
            @change=${wrapAction(component.actions?.onChange, ctx)}
          />
          ${String(component.props?.label ?? "")}
        </label>`;

    case "toggle":
      return html`
        <label class="toggle" ...=${baseAttrs}>
          <input
            type="checkbox"
            role="switch"
            ?checked=${!!component.props?.checked}
            @change=${wrapAction(component.actions?.onChange, ctx)}
          />
          ${String(component.props?.label ?? "")}
        </label>`;

    case "textarea":
      return html`
        <textarea
          ...=${baseAttrs}
          placeholder=${String(component.props?.placeholder ?? "")}
          @change=${wrapAction(component.actions?.onChange, ctx)}
        >${String(component.props?.value ?? "")}</textarea>`;

    case "card":
      return html`
        <div class="card" ...=${baseAttrs} @click=${wrapAction(component.actions?.onClick, ctx)}>
          ${component.props?.title ? html`<h3>${String(component.props.title)}</h3>` : nothing}
          ${renderChildren(component.children, ctx)}
        </div>`;

    case "table": {
      const columns = (component.props?.columns ?? []) as Array<{ key: string; label: string }>;
      const rows = (component.props?.rows ?? []) as Array<Record<string, unknown>>;
      return html`
        <table ...=${baseAttrs}>
          <thead><tr>${columns.map((col) => html`<th>${col.label}</th>`)}</tr></thead>
          <tbody>${rows.map((row) => html`<tr>${columns.map((col) => html`<td>${String(row[col.key] ?? "")}</td>`)}</tr>`)}</tbody>
        </table>`;
    }

    case "stack":
    case "row":
      return html`
        <div ...=${baseAttrs}>
          ${renderChildren(component.children, ctx)}
        </div>`;

    case "separator":
      return html`<hr ...=${baseAttrs} />`;

    case "spinner":
      return html`<div class="spinner" ...=${baseAttrs}>
        <div class="spinner__dot"></div>
        <div class="spinner__dot"></div>
        <div class="spinner__dot"></div>
      </div>`;

    case "metric":
      return html`
        <div class="metric" ...=${baseAttrs}>
          <span class="metric__value">${String(component.props?.value ?? "")}</span>
          <span class="metric__label">${String(component.props?.label ?? "")}</span>
        </div>`;

    case "image":
      return html`<img ...=${baseAttrs} src=${String(component.props?.src ?? "")} alt=${String(component.props?.alt ?? "")} />`;

    case "avatar":
      return html`<img class="avatar" ...=${baseAttrs} src=${String(component.props?.src ?? "")} alt=${String(component.props?.alt ?? "")} />`;

    case "link":
      return html`
        <a ...=${baseAttrs}
          href=${String(component.props?.href ?? "#")}
          target=${component.props?.external ? "_blank" : "_self"}
          @click=${wrapAction(component.actions?.onClick, ctx)}
        >${String(component.props?.content ?? "")}${renderChildren(component.children, ctx)}</a>`;

    case "tabs": {
      const tabs = (component.props?.tabs ?? []) as Array<{ id: string; label: string }>;
      return html`
        <div class="tabs" ...=${baseAttrs}>
          <nav class="tabs__nav">${tabs.map((tab) => html`<button class="tabs__tab" @click=${() => ctx.onAction({ type: "dispatch", event: "tab.select", payload: { tabId: tab.id } })}>${tab.label}</button>`)}</nav>
          <div class="tabs__content">${renderChildren(component.children, ctx)}</div>
        </div>`;
    }

    case "form":
      return html`
        <form ...=${baseAttrs} @submit=${wrapAction(component.actions?.onSubmit, ctx)}>
          ${renderChildren(component.children, ctx)}
          ${component.props?.submitLabel ? html`<button type="submit">${String(component.props.submitLabel)}</button>` : nothing}
        </form>`;

    case "container":
      return html`<div ...=${baseAttrs}>${renderChildren(component.children, ctx)}</div>`;

    default:
      return html`<div ...=${baseAttrs} data-bdui-type=${component.type}>${renderChildren(component.children, ctx)}</div>`;
  }
}

export function renderBduiPage(page: BduiPage, ctx?: Partial<BduiRendererContext>): TemplateResult {
  const context: BduiRendererContext = {
    state: ctx?.state ?? page.state ?? page.context ?? {},
    data: {},
    onAction: ctx?.onAction ?? ((action) => console.warn("BDUI action unhandled:", action.type)),
  };

  const layout = page.layout;
  const layoutClass = `bdui-layout bdui-layout--${layout.type}`;
  const breadcrumbs = layout.navigation?.breadcrumbs;

  return html`
    <div class=${layoutClass}>
      ${breadcrumbs && breadcrumbs.length > 0
        ? html`
          <nav class="bdui-breadcrumbs">
            ${breadcrumbs.map((crumb, i) => html`
              <span class="bdui-breadcrumbs__item">
                ${crumb.route
                  ? html`<a href=${crumb.route} @click=${(e: Event) => { e.preventDefault(); context.onAction({ type: "navigate", route: crumb.route }); }}>${crumb.label}</a>`
                  : html`<span>${crumb.label}</span>`}
                ${i < breadcrumbs.length - 1 ? html`<span class="bdui-breadcrumbs__sep">/</span>` : nothing}
              </span>
            `)}
          </nav>`
        : nothing}

      ${layout.icon ? html`<span class="bdui-layout__icon">${layout.icon}</span>` : nothing}
      ${layout.title ? html`<h1 class="bdui-layout__title">${layout.title}</h1>` : nothing}
      ${layout.subtitle ? html`<p class="bdui-layout__subtitle">${layout.subtitle}</p>` : nothing}

      <div class="bdui-layout__body">
        ${renderChildren(layout.children, context)}
      </div>
    </div>`;
}
