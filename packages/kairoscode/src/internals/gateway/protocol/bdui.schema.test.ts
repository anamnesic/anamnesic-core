import AjvPkg from "ajv";
import { describe, expect, it } from "vitest";
import type { ChannelsConfig } from "../../config/types.channels.js";
import type { ConfigFileSnapshot } from "../../config/types.openclaw.js";
import { buildAgentsPage, buildBduiPage, buildChannelsPage, buildSettingsPage } from "../server/bdui-pages.js";
import { validateBduiGetPageParams } from "./index.js";
import { BduiActionResponseSchema, BduiPageSchema, BduiRegistrySchema } from "./schema/bdui.js";

const ajv = new (AjvPkg as unknown as new (opts?: object) => import("ajv").default)({
  allErrors: true,
  strict: false,
  removeAdditional: false,
});

const checkPage = ajv.compile(BduiPageSchema);
const checkActionResponse = ajv.compile(BduiActionResponseSchema);
const checkRegistry = ajv.compile(BduiRegistrySchema);

describe("bdui.getPage params", () => {
  it("accepts a page id", () => {
    expect(validateBduiGetPageParams({ pageId: "overview" })).toBe(true);
  });

  it("rejects empty or missing page ids", () => {
    expect(validateBduiGetPageParams({ pageId: "" })).toBe(false);
    expect(validateBduiGetPageParams({})).toBe(false);
  });
});

describe("demo bdui page", () => {
  it("builds a valid overview page", () => {
    const page = buildBduiPage("overview");
    expect(checkPage(page)).toBe(true);
    expect(page.layout.title).toBe("BDUI Overview");
    expect(page.layout.children).toHaveLength(3);
  });

  it("builds a valid fallback page for unknown ids", () => {
    const page = buildBduiPage("missing");
    expect(checkPage(page)).toBe(true);
    expect(page.layout.title).toContain("missing");
  });
});

describe("plugins bdui page", () => {
  it("builds a valid plugins page", () => {
    const page = buildBduiPage("plugins");
    expect(checkPage(page)).toBe(true);
    expect(page.layout.title).toBe("Plugins");
  });
});

describe("tools bdui page", () => {
  it("builds a valid tools page", () => {
    const page = buildBduiPage("tools");
    expect(checkPage(page)).toBe(true);
    expect(page.layout.title).toBe("Tools");
  });
});

describe("providers bdui page", () => {
  it("builds a valid providers page", () => {
    const page = buildBduiPage("providers");
    expect(checkPage(page)).toBe(true);
    expect(page.layout.title).toBe("Providers");
  });
});

describe("settings bdui page", () => {
  const snapshot: ConfigFileSnapshot = {
    path: "/home/user/.kairos/openclaw.json5",
    exists: true,
    raw: "{}",
    parsed: {},
    sourceConfig: {},
    resolved: {},
    runtimeConfig: {
      meta: { lastTouchedVersion: "1.2.3", lastTouchedAt: "2026-07-31T00:00:00.000Z" },
      update: { channel: "stable" },
      models: {
        providers: {
          anthropic: {
            baseUrl: "https://api.anthropic.com",
            models: [
              {
                id: "claude",
                name: "Claude",
                reasoning: true,
                input: ["text"],
                cost: { input: 3, output: 15, cacheRead: 1, cacheWrite: 3 },
                contextWindow: 200000,
                maxTokens: 8192,
              },
            ],
          },
          openai: {
            baseUrl: "https://api.openai.com",
            models: [],
          },
        },
      },
    },
    config: {},
    valid: true,
    issues: [],
    warnings: [],
    legacyIssues: [],
  };

  it("builds a valid settings page from a config snapshot", () => {
    const page = buildSettingsPage(snapshot);
    expect(checkPage(page)).toBe(true);
    expect(page.layout.title).toBe("Settings");
    expect(JSON.stringify(page)).toContain("anthropic");
  });
});

describe("channels bdui page", () => {
  const channelsConfig: ChannelsConfig = {
    defaults: { groupPolicy: "everyone" },
    telegram: { enabled: true, accounts: { default: { token: "x" } } },
    discord: { enabled: false },
    slack: { enabled: true, accounts: { work: {}, personal: {} } },
  };

  it("builds a valid channels page from config and registry", () => {
    const page = buildChannelsPage(channelsConfig);
    expect(checkPage(page)).toBe(true);
    expect(page.layout.title).toBe("Channels");
    expect(JSON.stringify(page)).toContain("telegram");
    expect(JSON.stringify(page)).toContain("discord");
    expect(JSON.stringify(page)).toContain("slack");
  });
});

describe("agents bdui page", () => {
  it("builds a valid agents page (runs without error)", () => {
    const page = buildAgentsPage();
    expect(checkPage(page)).toBe(true);
    expect(page.layout.title).toBe("Agents");
  });
});

describe("bdui page schema", () => {
  it("validates recursively nested components", () => {
    const page = {
      schema: "bdui/v1",
      layout: {
        type: "page",
        title: "Nested",
        children: [
          {
            key: "outer",
            type: "row",
            children: [
              {
                key: "inner",
                type: "card",
                children: [
                  { key: "leaf", type: "text", props: { content: "deep" } },
                ],
              },
            ],
          },
        ],
      },
    };
    expect(checkPage(page)).toBe(true);
  });

  it("rejects components with unknown top-level keys", () => {
    const page = {
      schema: "bdui/v1",
      layout: {
        type: "page",
        children: [{ key: "bad", type: "text", wat: true }],
      },
    };
    expect(checkPage(page)).toBe(false);
  });

  it("rejects invalid data expressions", () => {
    const page = {
      schema: "bdui/v1",
      layout: {
        type: "page",
        children: [
          {
            key: "bad",
            type: "text",
            conditions: { show: { source: "nope", path: "x" } },
          },
        ],
      },
    };
    expect(checkPage(page)).toBe(false);
  });
});

describe("bdui action response schema", () => {
  it("validates patch and state updates", () => {
    expect(
      checkActionResponse({
        schema: "bdui/v1",
        action: "toggle.extra",
        state: { extraVisible: true },
        patch: [{ op: "replace", path: "/state/extraVisible", value: true }],
        toast: { message: "done", severity: "success" },
      }),
    ).toBe(true);
  });

  it("rejects unknown patch operations", () => {
    expect(
      checkActionResponse({
        schema: "bdui/v1",
        action: "toggle.extra",
        patch: [{ op: "mutate", path: "/state/extraVisible", value: true }],
      }),
    ).toBe(false);
  });
});

describe("bdui registry schema", () => {
  it("accepts component registrations", () => {
    expect(
      checkRegistry({
        components: [
          {
            type: "gauge",
            schema: { value: { type: "number" } },
            defaultProps: { max: 100 },
            category: "metric",
            description: "A gauge",
          },
        ],
      }),
    ).toBe(true);
  });

  it("accepts registry pages", () => {
    expect(
      checkRegistry({
        pages: [
          { id: "overview", label: "Overview", icon: "dashboard" },
          { id: "settings", label: "Settings" },
        ],
        components: [],
      }),
    ).toBe(true);
  });

  it("rejects pages without an id", () => {
    expect(checkRegistry({ pages: [{ label: "No id" }], components: [] })).toBe(false);
  });

  it("rejects registrations without a type", () => {
    expect(checkRegistry({ components: [{ schema: {} }] })).toBe(false);
  });
});
