import { LitElement, css, html } from "lit";
import { property, state } from "lit/decorators.js";
import type { BduiPage, BduiAction } from "../../../../infra/src/types/bdui.js";
import {
  applyBduiActionResponse,
  dispatchBduiAction,
  loadBduiPage,
} from "../controllers/bdui.ts";
import { renderBduiPage } from "../views/bdui-renderer.ts";

export class BduiPageElement extends LitElement {
  @property({ type: String }) pageId = "";
  @property({ type: String }) basePath = "";

  @state() private page: BduiPage | null = null;
  @state() private pageState: Record<string, unknown> = {};
  @state() private loading = false;
  @state() private error: string | null = null;

  static styles = css`
    :host {
      display: block;
    }

    .bdui-page__loading,
    .bdui-page__error {
      padding: 24px;
      text-align: center;
      color: var(--muted, #888);
    }

    .bdui-page__error {
      color: var(--danger, #e5484d);
    }

    .bdui-page__error-detail {
      margin-top: 8px;
      font-size: 13px;
      color: var(--muted, #888);
    }
  `;

  override async connectedCallback() {
    super.connectedCallback();
    await this.load();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has("pageId") || changed.has("basePath")) {
      void this.load();
    }
  }

  private async load() {
    if (!this.pageId) return;
    this.loading = true;
    this.error = null;
    try {
      const page = await loadBduiPage({
        basePath: this.basePath,
        pageId: this.pageId,
      });
      this.page = page;
      this.pageState = { ...(page.state ?? page.context ?? {}) };
    } catch (err) {
      this.error = err instanceof Error ? err.message : "Unknown error";
      this.page = null;
    } finally {
      this.loading = false;
    }
  }

  private async handleAction(action: BduiAction) {
    if (!this.pageId) return;
    try {
      const response = await dispatchBduiAction(this.basePath, {
        pageId: this.pageId,
        action,
        state: this.pageState,
      });
      this.pageState = applyBduiActionResponse(this.pageState, response);
    } catch {
      this.error = "BDUI action failed";
    }
  }

  override render() {
    if (this.loading) {
      return html`<div class="bdui-page__loading">Loading BDUI page…</div>`;
    }
    if (this.error) {
      return html`
        <div class="bdui-page__error">
          <div>Failed to load BDUI page</div>
          <div class="bdui-page__error-detail">${this.error}</div>
        </div>
      `;
    }
    if (!this.page) {
      return html`<div class="bdui-page__loading">No BDUI page</div>`;
    }
    return renderBduiPage(this.page, {
      state: this.pageState,
      onAction: (action) => void this.handleAction(action),
    });
  }
}

if (!customElements.get("bdui-page")) {
  customElements.define("bdui-page", BduiPageElement);
}

declare global {
  interface HTMLElementTagNameMap {
    "bdui-page": BduiPageElement;
  }
}
