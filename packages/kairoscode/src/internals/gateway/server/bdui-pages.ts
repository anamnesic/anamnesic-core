import { type Static } from "typebox";
import { readConfigFileSnapshot } from "../../config/config.js";
import { redactConfigSnapshot } from "../../config/redact-snapshot.js";
import { loadGatewayRuntimeConfigSchema } from "../../config/runtime-schema.js";
import type { ChannelsConfig, ExtensionChannelConfig } from "../../config/types.channels.js";
import type { ConfigFileSnapshot } from "../../config/types.openclaw.js";
import { getActivePluginRegistry } from "../../plugins/runtime.js";
import { listAgentsForGateway } from "../session-utils.js";
import { getRuntimeConfig } from "../../config/io.js";
import { BduiPageSchema } from "../protocol/schema/bdui.js";

type BduiPage = Static<typeof BduiPageSchema>;

export type BduiPageEntry = {
  id: string;
  label: string;
  icon?: string;
};

export function getBduiPageRegistry(): BduiPageEntry[] {
  return [
    { id: "overview", label: "Overview", icon: "dashboard" },
    { id: "agents", label: "Agents", icon: "bot" },
    { id: "projects", label: "Projects", icon: "folder" },
    { id: "commands", label: "Commands", icon: "command" },
    { id: "hooks", label: "Hooks", icon: "hook" },
    { id: "workflows", label: "Workflows", icon: "workflow" },
    { id: "skills", label: "Skills", icon: "skill" },
    { id: "tools", label: "Tools", icon: "tool" },
    { id: "extensions", label: "Extensions", icon: "extension" },
    { id: "plugins", label: "Plugins", icon: "plugin" },
    { id: "providers", label: "Providers", icon: "model" },
    { id: "channels", label: "Channels", icon: "channel" },
    { id: "memory", label: "Memory", icon: "memory" },
    { id: "observers", label: "Observers", icon: "observer" },
    { id: "vault", label: "Vault", icon: "vault" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];
}

function buildCommandsPage(): BduiPage {
  const commands = getActivePluginRegistry()?.commands ?? [];
  const rows = commands.map((entry) => ({
    name: entry.command.name,
    description: entry.command.description,
    plugin: entry.pluginName ?? entry.pluginId,
    acceptsArgs: entry.command.acceptsArgs ? "yes" : "no",
    requireAuth: entry.command.requireAuth === false ? "no" : "yes",
  }));
  const withArgs = rows.filter((row) => row.acceptsArgs === "yes").length;

  return {
    schema: "bdui/v1",
    layout: {
      type: "page",
      title: "Commands",
      subtitle: `${rows.length} slash commands registered`,
      navigation: {
        breadcrumbs: [{ label: "Control" }, { label: "Commands" }],
      },
      children: [
        {
          key: "commands-metrics",
          type: "row",
          style: { gap: "12px" },
          children: [
            {
              key: "metric-commands",
              type: "metric",
              props: { value: String(rows.length), label: "Commands" },
            },
            {
              key: "metric-args",
              type: "metric",
              props: { value: String(withArgs), label: "Accepts args" },
            },
          ],
        },
        {
          key: "commands-card",
          type: "card",
          props: { title: "Registered" },
          children: [
            {
              key: "commands-table",
              type: "table",
              props: {
                columns: [
                  { key: "name", label: "Command" },
                  { key: "description", label: "Description" },
                  { key: "plugin", label: "Plugin" },
                  { key: "acceptsArgs", label: "Args" },
                  { key: "requireAuth", label: "Auth" },
                ],
                rows,
              },
            },
            {
              key: "commands-reload",
              type: "button",
              props: { label: "Reload" },
              actions: { onClick: { type: "dispatch", event: "reload" } },
            },
          ],
        },
      ],
    },
  };
}

function buildPluginsPage(): BduiPage {
  const plugins = getActivePluginRegistry()?.plugins ?? [];
  const loaded = plugins.filter((plugin) => plugin.status === "loaded" && plugin.enabled).length;
  const disabled = plugins.filter((plugin) => plugin.status === "disabled" || !plugin.enabled).length;
  const errored = plugins.filter((plugin) => plugin.status === "error").length;

  return {
    schema: "bdui/v1",
    layout: {
      type: "page",
      title: "Plugins",
      subtitle: `${plugins.length} installed plugins`,
      navigation: {
        breadcrumbs: [{ label: "Control" }, { label: "Plugins" }],
      },
      children: [
        {
          key: "plugin-metrics",
          type: "row",
          style: { gap: "12px" },
          children: [
            {
              key: "metric-loaded",
              type: "metric",
              props: { value: String(loaded), label: "Loaded" },
            },
            {
              key: "metric-disabled",
              type: "metric",
              props: { value: String(disabled), label: "Disabled" },
            },
            {
              key: "metric-errored",
              type: "metric",
              props: { value: String(errored), label: "Errors" },
            },
          ],
        },
        {
          key: "plugins-card",
          type: "card",
          props: { title: "Installed" },
          children: [
            {
              key: "plugins-table",
              type: "table",
              props: {
                columns: [
                  { key: "name", label: "Plugin" },
                  { key: "version", label: "Version" },
                  { key: "status", label: "Status" },
                  { key: "kind", label: "Kind" },
                  { key: "tools", label: "Tools" },
                  { key: "source", label: "Source" },
                ],
                rows: plugins.map((plugin) => ({
                  name: plugin.name,
                  version: plugin.version ?? "-",
                  status: plugin.status,
                  kind: Array.isArray(plugin.kind) ? plugin.kind.join(", ") : plugin.kind ?? "",
                  tools: plugin.toolNames.length,
                  source: plugin.source,
                })),
              },
            },
            {
              key: "plugins-reload",
              type: "button",
              props: { label: "Reload" },
              actions: { onClick: { type: "dispatch", event: "reload" } },
            },
          ],
        },
      ],
    },
  };
}

function buildToolsPage(): BduiPage {
  const tools = getActivePluginRegistry()?.tools ?? [];
  const rows = tools.flatMap((tool) =>
    tool.names.map((name) => ({
      name,
      plugin: tool.pluginName ?? tool.pluginId,
      optional: tool.optional ? "yes" : "no",
      source: tool.source,
    })),
  );
  const optional = rows.filter((row) => row.optional === "yes").length;

  return {
    schema: "bdui/v1",
    layout: {
      type: "page",
      title: "Tools",
      subtitle: `${rows.length} tools registered`,
      navigation: {
        breadcrumbs: [{ label: "Control" }, { label: "Tools" }],
      },
      children: [
        {
          key: "tool-metrics",
          type: "row",
          style: { gap: "12px" },
          children: [
            {
              key: "metric-tools",
              type: "metric",
              props: { value: String(rows.length), label: "Tools" },
            },
            {
              key: "metric-optional",
              type: "metric",
              props: { value: String(optional), label: "Optional" },
            },
          ],
        },
        {
          key: "tools-card",
          type: "card",
          props: { title: "Catalog" },
          children: [
            {
              key: "tools-table",
              type: "table",
              props: {
                columns: [
                  { key: "name", label: "Tool" },
                  { key: "plugin", label: "Plugin" },
                  { key: "optional", label: "Optional" },
                  { key: "source", label: "Source" },
                ],
                rows,
              },
            },
            {
              key: "tools-reload",
              type: "button",
              props: { label: "Reload" },
              actions: { onClick: { type: "dispatch", event: "reload" } },
            },
          ],
        },
      ],
    },
  };
}

function buildProvidersPage(): BduiPage {
  const providers = getActivePluginRegistry()?.providers ?? [];
  const rows = providers.map(({ pluginId, pluginName, provider, source }) => ({
    id: provider.id,
    label: provider.label,
    plugin: pluginName ?? pluginId,
    auth: (provider.auth ?? []).map((method) => method.kind).join(", "),
    source,
  }));

  return {
    schema: "bdui/v1",
    layout: {
      type: "page",
      title: "Providers",
      subtitle: `${rows.length} providers registered`,
      navigation: {
        breadcrumbs: [{ label: "Control" }, { label: "Providers" }],
      },
      children: [
        {
          key: "provider-metrics",
          type: "row",
          style: { gap: "12px" },
          children: [
            {
              key: "metric-providers",
              type: "metric",
              props: { value: String(rows.length), label: "Providers" },
            },
          ],
        },
        {
          key: "providers-card",
          type: "card",
          props: { title: "Registered" },
          children: [
            {
              key: "providers-table",
              type: "table",
              props: {
                columns: [
                  { key: "id", label: "Provider" },
                  { key: "label", label: "Label" },
                  { key: "plugin", label: "Plugin" },
                  { key: "auth", label: "Auth" },
                  { key: "source", label: "Source" },
                ],
                rows,
              },
            },
            {
              key: "providers-reload",
              type: "button",
              props: { label: "Reload" },
              actions: { onClick: { type: "dispatch", event: "reload" } },
            },
          ],
        },
      ],
    },
  };
}

function buildHooksPage(): BduiPage {
  const registry = getActivePluginRegistry();
  const typedHooks = registry?.typedHooks ?? [];
  const legacyHooks = registry?.hooks ?? [];
  const rows = typedHooks.map((hook) => ({
    hook: hook.hookName,
    plugin: hook.pluginId,
    priority: String(hook.priority ?? 0),
    source: hook.source,
  }));
  const distinctHooks = new Set(rows.map((row) => row.hook));
  const legacyCount = legacyHooks.length;

  return {
    schema: "bdui/v1",
    layout: {
      type: "page",
      title: "Hooks",
      subtitle: `${distinctHooks.size} hook events, ${rows.length} registrations`,
      navigation: {
        breadcrumbs: [{ label: "Control" }, { label: "Hooks" }],
      },
      children: [
        {
          key: "hooks-metrics",
          type: "row",
          style: { gap: "12px" },
          children: [
            {
              key: "metric-events",
              type: "metric",
              props: { value: String(distinctHooks.size), label: "Hook events" },
            },
            {
              key: "metric-typed",
              type: "metric",
              props: { value: String(rows.length), label: "Typed registrations" },
            },
            {
              key: "metric-legacy",
              type: "metric",
              props: { value: String(legacyCount), label: "Legacy" },
            },
          ],
        },
        {
          key: "hooks-card",
          type: "card",
          props: { title: "Registered hooks" },
          children: [
            {
              key: "hooks-table",
              type: "table",
              props: {
                columns: [
                  { key: "hook", label: "Hook" },
                  { key: "plugin", label: "Plugin" },
                  { key: "priority", label: "Priority" },
                  { key: "source", label: "Source" },
                ],
                rows,
              },
            },
            {
              key: "hooks-reload",
              type: "button",
              props: { label: "Reload" },
              actions: { onClick: { type: "dispatch", event: "reload" } },
            },
          ],
        },
      ],
    },
  };
}

export function buildProjectsPage(snapshot: ConfigFileSnapshot): BduiPage {
  const config = snapshot.runtimeConfig;
  const agents = listAgentsForGateway(config).agents;
  const defaultWorkspace = config.agents?.defaults?.workspace;
  const seen = new Map<string, { workspace: string; agents: string[]; default: boolean }>();
  if (defaultWorkspace) {
    seen.set(defaultWorkspace, { workspace: defaultWorkspace, agents: [], default: true });
  }
  for (const agent of agents) {
    const workspace = agent.workspace ?? defaultWorkspace ?? "-";
    const entry = seen.get(workspace);
    const agentId = agent.id;
    if (entry) {
      entry.agents.push(agentId);
    } else {
      seen.set(workspace, { workspace, agents: [agentId], default: workspace === defaultWorkspace });
    }
  }
  const rows = [...seen.values()].map((entry) => ({
    workspace: entry.workspace,
    agents: entry.agents.length,
    default: entry.default ? "yes" : "no",
  }));
  const defaultCount = rows.filter((row) => row.default === "yes").length;

  return {
    schema: "bdui/v1",
    layout: {
      type: "page",
      title: "Projects",
      subtitle: `${rows.length} workspaces`,
      navigation: {
        breadcrumbs: [{ label: "Control" }, { label: "Projects" }],
      },
      children: [
        {
          key: "projects-metrics",
          type: "row",
          style: { gap: "12px" },
          children: [
            {
              key: "metric-workspaces",
              type: "metric",
              props: { value: String(rows.length), label: "Workspaces" },
            },
            {
              key: "metric-default",
              type: "metric",
              props: { value: String(defaultCount), label: "Default" },
            },
            {
              key: "metric-agents",
              type: "metric",
              props: { value: String(agents.length), label: "Agents" },
            },
          ],
        },
        {
          key: "projects-card",
          type: "card",
          props: { title: "Workspaces" },
          children: [
            {
              key: "projects-table",
              type: "table",
              props: {
                columns: [
                  { key: "workspace", label: "Workspace" },
                  { key: "agents", label: "Agents" },
                  { key: "default", label: "Default" },
                ],
                rows,
              },
            },
          ],
        },
      ],
    },
  };
}

export function buildOverviewPage(snapshot: ConfigFileSnapshot): BduiPage {
  const registry = getActivePluginRegistry();
  const plugins = registry?.plugins ?? [];
  const pluginsLoaded = plugins.filter((plugin) => plugin.status === "loaded" && plugin.enabled).length;
  const pluginsErrored = plugins.filter((plugin) => plugin.status === "error").length;
  const tools = registry?.tools ?? [];
  const toolCount = tools.flatMap((tool) => tool.names).length;
  const providers = registry?.providers ?? [];
  const channels = registry?.channels ?? [];
  const channelRegistrations = channels.length;
  const channelsConfigured = Object.entries(snapshot.runtimeConfig.channels ?? {}).filter(
    (key) => key[0] !== "defaults" && key[0] !== "modelByChannel",
  ).length;
  const config = snapshot.runtimeConfig;
  const modelProviders = Object.keys(config.models?.providers ?? {});
  const agents = listAgentsForGateway(config).agents.length;

  return {
    schema: "bdui/v1",
    layout: {
      type: "page",
      title: "Overview",
      subtitle: "Live snapshot of the kairoscode sidecar.",
      icon: "barChart",
      navigation: {
        breadcrumbs: [{ label: "Control" }, { label: "Overview" }],
      },
      children: [
        {
          key: "overview-metrics",
          type: "row",
          style: { gap: "12px" },
          children: [
            {
              key: "metric-agents",
              type: "metric",
              props: { value: String(agents), label: "Agents" },
            },
            {
              key: "metric-plugins",
              type: "metric",
              props: { value: String(pluginsLoaded), label: "Plugins loaded" },
            },
            {
              key: "metric-tools",
              type: "metric",
              props: { value: String(toolCount), label: "Tools" },
            },
            {
              key: "metric-providers",
              type: "metric",
              props: { value: String(providers.length), label: "Providers" },
            },
            {
              key: "metric-channels",
              type: "metric",
              props: { value: String(channelsConfigured), label: "Channels" },
            },
          ],
        },
        {
          key: "overview-health-card",
          type: "card",
          props: { title: "Health" },
          children: [
            {
              key: "overview-health-table",
              type: "table",
              props: {
                columns: [
                  { key: "key", label: "Key" },
                  { key: "value", label: "Value" },
                ],
                rows: [
                  { key: "config valid", value: snapshot.valid ? "yes" : "no" },
                  { key: "config issues", value: String(snapshot.issues.length) },
                  { key: "config warnings", value: String(snapshot.warnings.length) },
                  { key: "plugins errors", value: String(pluginsErrored) },
                  { key: "channel registrations", value: String(channelRegistrations) },
                  { key: "model providers (ref)", value: String(modelProviders.length) },
                ],
              },
            },
          ],
        },
        {
          key: "overview-links-card",
          type: "card",
          props: { title: "Jump to" },
          children: [
            {
              key: "link-agents",
              type: "link",
              props: { content: "Agents", href: "/control/agents" },
              actions: { onClick: { type: "navigate", route: "/control/agents" } },
            },
            {
              key: "link-plugins",
              type: "link",
              props: { content: "Plugins", href: "/control/plugins" },
              actions: { onClick: { type: "navigate", route: "/control/plugins" } },
            },
            {
              key: "link-channels",
              type: "link",
              props: { content: "Channels", href: "/control/channels" },
              actions: { onClick: { type: "navigate", route: "/control/channels" } },
            },
            {
              key: "link-settings",
              type: "link",
              props: { content: "Settings", href: "/control/settings" },
              actions: { onClick: { type: "navigate", route: "/control/settings" } },
            },
          ],
        },
      ],
    },
  };
}

export function buildSettingsPage(snapshot: ConfigFileSnapshot): BduiPage {
  const config = snapshot.runtimeConfig;
  const providers = Object.entries(config.models?.providers ?? {});
  const format = snapshot.path.endsWith(".json5")
    ? "JSON5"
    : snapshot.path.endsWith(".json")
      ? "JSON"
      : "OpenClaw";

  return {
    schema: "bdui/v1",
    layout: {
      type: "page",
      title: "Settings",
      subtitle: "Live configuration from the kairoscode sidecar.",
      navigation: {
        breadcrumbs: [{ label: "Control" }, { label: "Settings" }],
      },
      children: [
        {
          key: "settings-metrics",
          type: "row",
          style: { gap: "12px" },
          children: [
            {
              key: "metric-valid",
              type: "metric",
              props: { value: snapshot.valid ? "Yes" : "No", label: "Config valid" },
            },
            {
              key: "metric-providers",
              type: "metric",
              props: { value: String(providers.length), label: "Providers" },
            },
            {
              key: "metric-issues",
              type: "metric",
              props: { value: String(snapshot.issues.length), label: "Issues" },
            },
          ],
        },
        {
          key: "settings-file-card",
          type: "card",
          props: { title: "Config file" },
          children: [
            {
              key: "settings-file-table",
              type: "table",
              props: {
                columns: [
                  { key: "key", label: "Key" },
                  { key: "value", label: "Value" },
                ],
                rows: [
                  { key: "path", value: snapshot.path },
                  { key: "format", value: format },
                  { key: "valid", value: snapshot.valid ? "yes" : "no" },
                  { key: "warnings", value: String(snapshot.warnings.length) },
                  { key: "issues", value: String(snapshot.issues.length) },
                  { key: "version", value: config.meta?.lastTouchedVersion ?? "-" },
                  { key: "last touched", value: config.meta?.lastTouchedAt ?? "-" },
                  { key: "update channel", value: config.update?.channel ?? "-" },
                ],
              },
            },
          ],
        },
        {
          key: "settings-providers-card",
          type: "card",
          props: { title: "Model providers" },
          children: [
            {
              key: "settings-providers-table",
              type: "table",
              props: {
                columns: [
                  { key: "id", label: "Provider" },
                  { key: "baseUrl", label: "Base URL" },
                  { key: "models", label: "Models" },
                ],
                rows: providers.map(([id, provider]) => ({
                  id,
                  baseUrl: provider.baseUrl ?? "-",
                  models: provider.models.length,
                })),
              },
            },
          ],
        },
      ],
    },
  };
}

export function buildChannelsPage(channels: ChannelsConfig): BduiPage {
  const registrations = getActivePluginRegistry()?.channels ?? [];
  const byId = new Map(registrations.map((registration) => [registration.plugin.id, registration]));
  const configured = Object.entries(channels).filter(
    (key) => key[0] !== "defaults" && key[0] !== "modelByChannel",
  );
  const rows = configured.map(([id, value]) => {
    const section = value as ExtensionChannelConfig;
    const enabled = section.enabled !== false;
    return {
      id,
      enabled: enabled ? "yes" : "no",
      accounts: section.accounts ? Object.keys(section.accounts).length : 0,
      source: byId.get(id)?.source ?? "builtin",
    };
  });
  const enabledCount = rows.filter((row) => row.enabled === "yes").length;

  return {
    schema: "bdui/v1",
    layout: {
      type: "page",
      title: "Channels",
      subtitle: `${rows.length} configured channels`,
      navigation: {
        breadcrumbs: [{ label: "Control" }, { label: "Channels" }],
      },
      children: [
        {
          key: "channels-metrics",
          type: "row",
          style: { gap: "12px" },
          children: [
            {
              key: "metric-configured",
              type: "metric",
              props: { value: String(rows.length), label: "Configured" },
            },
            {
              key: "metric-enabled",
              type: "metric",
              props: { value: String(enabledCount), label: "Enabled" },
            },
            {
              key: "metric-plugins",
              type: "metric",
              props: { value: String(registrations.length), label: "Plugins" },
            },
          ],
        },
        {
          key: "channels-configured-card",
          type: "card",
          props: { title: "Configured" },
          children: [
            {
              key: "channels-configured-table",
              type: "table",
              props: {
                columns: [
                  { key: "id", label: "Channel" },
                  { key: "enabled", label: "Enabled" },
                  { key: "accounts", label: "Accounts" },
                  { key: "source", label: "Source" },
                ],
                rows,
              },
            },
          ],
        },
        {
          key: "channels-plugins-card",
          type: "card",
          props: { title: "Registered channel plugins" },
          children: [
            {
              key: "channels-plugins-table",
              type: "table",
              props: {
                columns: [
                  { key: "id", label: "Channel" },
                  { key: "label", label: "Label" },
                  { key: "source", label: "Source" },
                ],
                rows: registrations.map(({ plugin, source }) => ({
                  id: plugin.id,
                  label: plugin.meta.label,
                  source,
                })),
              },
            },
          ],
        },
      ],
    },
  };
}

function buildAgentsPage(): BduiPage {
  const cfg = getRuntimeConfig();
  const { agents, defaultId } = listAgentsForGateway(cfg);
  const rows = agents.map((agent) => ({
    id: agent.id,
    name: agent.name ?? "-",
    model: agent.model?.primary ?? agent.model?.fallbacks?.[0] ?? "-",
    workspace: agent.workspace ?? "-",
    default: agent.id === defaultId ? "yes" : "no",
  }));

  return {
    schema: "bdui/v1",
    layout: {
      type: "page",
      title: "Agents",
      subtitle: `${agents.length} agents configured`,
      navigation: {
        breadcrumbs: [{ label: "Control" }, { label: "Agents" }],
      },
      children: [
        {
          key: "agents-metrics",
          type: "row",
          style: { gap: "12px" },
          children: [
            {
              key: "metric-agents",
              type: "metric",
              props: { value: String(agents.length), label: "Agents" },
            },
          ],
        },
        {
          key: "agents-card",
          type: "card",
          props: { title: "Configured agents" },
          children: [
            {
              key: "agents-table",
              type: "table",
              props: {
                columns: [
                  { key: "id", label: "Agent" },
                  { key: "name", label: "Name" },
                  { key: "model", label: "Model" },
                  { key: "workspace", label: "Workspace" },
                  { key: "default", label: "Default" },
                ],
                rows,
              },
            },
          ],
        },
      ],
    },
  };
}

async function readRedactedConfigSnapshot(): Promise<ConfigFileSnapshot> {
  const snapshot = await readConfigFileSnapshot();
  const schema = loadGatewayRuntimeConfigSchema();
  return redactConfigSnapshot(snapshot, schema.uiHints);
}

export async function getBduiPage(pageId: string): Promise<BduiPage> {
  if (pageId === "overview") {
    return buildOverviewPage(await readRedactedConfigSnapshot());
  }
  if (pageId === "projects") {
    return buildProjectsPage(await readRedactedConfigSnapshot());
  }
  if (pageId === "settings") {
    return buildSettingsPage(await readRedactedConfigSnapshot());
  }
  if (pageId === "channels") {
    const snapshot = await readRedactedConfigSnapshot();
    return buildChannelsPage(snapshot.runtimeConfig.channels ?? {});
  }
  if (pageId === "agents") {
    return buildAgentsPage();
  }
  return buildBduiPage(pageId);
}

export function buildBduiPage(pageId: string): BduiPage {
  if (pageId === "commands") {
    return buildCommandsPage();
  }
  if (pageId === "hooks") {
    return buildHooksPage();
  }
  if (pageId === "plugins") {
    return buildPluginsPage();
  }

  if (pageId === "tools") {
    return buildToolsPage();
  }

  if (pageId === "providers") {
    return buildProvidersPage();
  }

  return {
    schema: "bdui/v1",
    layout: {
      type: "page",
      title: `BDUI Page: ${pageId}`,
      subtitle: "Unknown page - no server handler registered yet.",
      children: [
        {
          key: "fallback-text",
          type: "text",
          props: {
            content: "This page is not defined on the server yet.",
          },
        },
      ],
    },
  };
}
