# ADR: Shell dinâmico BDUI no Desktop + transporte offline-first

**Date:** 2026-07-31
**Status:** Accepted

## Context

O Desktop (SolidJS) consumia BDUI de forma isolada: 14 páginas nativas de gestão
(`dashboard.tsx`, `agents.tsx`, ...) quebradas contra o envelope
`{ success, data, timestamp }` do `packages/app`, e uma única página BDUI de demo
(`/management/bdui`) alimentada por `buildDemoBduiPage`. O produto é nativo e
deve funcionar offline, com o gateway kairoscode como sidecar local. Rotas HTTP
`/api/v1/*` e o contrato do `packages/app` não participam da arquitetura nova.

## Decision

### 1. Frontend 100% dinâmico (shell server-driven)

- Uma rota única genérica `/control/:pageId` renderiza o renderer BDUI; o
  `pageId` vem da URL (`useParams`). `/control` redireciona para
  `/control/overview`.
- A navegação lateral é montada a partir do registry: `bdui.registry` passa a
  expor `pages` (id, label, icon opcional). Nenhuma página nativa de gestão é
  roteada; elas viram dead code e são removidas na limpeza (Fase 3).
- Ícones são nomes semânticos server-driven; o renderer os mapeará para o
  conjunto de ícones nativo em um passo futuro (até lá, só o label é exibido).

### 2. `bdui.action` como server-method RPC

- O protocolo do gateway ganha `bdui.action` (schema `BduiActionParams` +
  validator + allowlist WRITE_SCOPE e lista de métodos). O `dispatch` de ações
  deixa de ser fake: resolver compartilhado em `server/bdui-actions.ts` usado
  pelo RPC e pelo HTTP `/ui/action`.
- `navigate` → resposta com `navigate`; `dispatch` → handler por página; o fake
  `toggle.extra` da demo é removido junto com o toggle/extra-card.

### 3. Transporte oficial do Desktop: HTTP local (loopback)

- O Desktop mantém `fetch` para `http://127.0.0.1` via `platform.fetch`
  (tauriFetch) + Basic auth, coerente com o client `@kairos-ai/sdk` (HTTP/SSE)
  já usado. Os endpoints `/ui/*` continuam sendo a fonte de dados do desktop,
  mas como transporte local, não como contrato REST do produto.
- O RPC/WebSocket local (`@kairos/sdk`, `client.bdui.*`) fica reservado para
  clientes CLI/headless. `BduiNamespace` (`getPage`, `registry`, `action`) já
  está exposto no SDK para esse uso.

### 4. Dados reais, não demo

- Primeiras páginas reais: **Plugins** e **Tools**, ambas síncronas a partir do
  `getActivePluginRegistry()` (sem migração de dados). `buildDemoBduiPage` vira
  `buildBduiPage` com branches reais por página e fallback para página não
  registrada.
- Fontes assíncronas (ex.: config do sidecar) entram via `getBduiPage` async,
  orquestrado no mesmo módulo (`bdui-pages.ts`): `bdui.getPage` RPC e HTTP
  `/ui/page/:pageId` passam a ser async e compartilham o resolver. A página
  `settings` lê `readConfigFileSnapshot()` + `redactConfigSnapshot()` (mesmo
  caminho de `config.get`), nunca expondo secrets.

## Status

| Item | Status |
|------|--------|
| Rota genérica `/control/:pageId` + redirect | ✅ |
| Nav dinâmica via `loadBduiRegistry` (`bdui.registry.pages`) | ✅ |
| `BduiRegistrySchema` com `pages` (protocolo) | ✅ |
| Server-method RPC `bdui.action` (+ schema/validator/allowlists) | ✅ |
| Resolver compartilhado RPC+HTTP (`server/bdui-actions.ts`) | ✅ |
| Remoção do fake `toggle.extra` | ✅ |
| `BduiNamespace` no SDK (`client.bdui.*`) | ✅ |
| Página real `plugins` (registry) | ✅ |
| Página real `tools` (registry) | ✅ |
| Página real `providers` (registry) | ✅ |
| Página real `settings` (config snapshot redigido) | ✅ |
| Página real `channels` (config + registry) | ✅ |
| Página real `agents` (lista + model/workspace) | ✅ |
| Página real `projects` (workspaces derivados de agents + defaults, contagem de agentes, flag default) | ✅ |
| Página real `commands` (slash commands do `registry.commands` — name, description, plugin, args, auth) | ✅ |
| Página real `hooks` (typedHooks + legacy — hookName, plugin, priority, source) | ✅ |
| Página real `services` (plugin services + discovery — id, plugin, stop, source) | ✅ |
| Página real `overview` (dashboard de landing com métricas reais do registry + health do config) | ✅ |
| `bdui.getPage` async (RPC + HTTP) compartilhado | ✅ |
| Decisão de transporte HTTP loopback registrada | ✅ |
| Diretriz de paridade conceitual das BDUI pages (skills/extensions/providers/channels) no `AGENTS.md` raiz | ✅ |
| Próximas páginas reais (projects, skills, ...) | 📝 |
| Settings — action `save`/`reload` | 📝 |
| Channels — action `connect`/`disconnect` | 📝 |
| Agents — action `create`/`start`/`pause`/`delete` | 📝 |

## Changelog

| Data | Mudança |
|------|---------|
| 2026-07-31 | Shell dinâmico no Desktop: rota única `/control/:pageId`, redirect `/control` → `/control/overview`, sidebar server-driven (`loadBduiRegistry`) |
| 2026-07-31 | `BduiPageEntry` e `BduiRegistryEntry.pages` em `@kairos/infra`; `BduiRegistrySchema` com `pages` no protocolo |
| 2026-07-31 | Registry do sidecar expõe `pages` (HTTP `/ui/registry` e RPC `bdui.registry`) |
| 2026-07-31 | Server-method RPC `bdui.action` (schema `BduiActionParams`, validator, allowlists WRITE_SCOPE/methods) |
| 2026-07-31 | Resolver compartilhado `server/bdui-actions.ts` (RPC + HTTP); fake `toggle.extra` removido |
| 2026-07-31 | `BduiNamespace` no `@kairos/sdk` (`getPage`, `registry`, `action`) |
| 2026-07-31 | `buildDemoBduiPage` → `buildBduiPage`; página real `plugins` com dados do `getActivePluginRegistry()` |
| 2026-07-31 | Página real `tools` a partir de `registry.tools` |
| 2026-07-31 | Página real `providers` a partir de `registry.providers` (id, label, plugin, auth kinds) |
| 2026-07-31 | `bdui.getPage` e HTTP `/ui/page/:pageId` async via `getBduiPage` (mesmo orquestrador em `bdui-pages.ts`) |
| 2026-07-31 | Página real `settings` com `readConfigFileSnapshot()` + `redactConfigSnapshot()` (path, valid, issues/warnings, providers) — sem secrets |
| 2026-07-31 | Página real `channels` lendo `config.channels` (redigido) + `registry.channels` (id, label, source, enabled, accounts) |
| 2026-07-31 | Página real `agents` via `listAgentsForGateway` (id, name, model, workspace, default) |
| 2026-07-31 | Página real `projects` via `buildProjectsPage` — workspaces derivados de `agents.list[].workspace` + `agents.defaults.workspace`, com contagem de agentes por workspace e flag default (sem migração de dados; gateway lista workspaces como o Linear lista projects, reusando config de agentes) |
| 2026-07-31 | Página real `commands` via `buildCommandsPage` — slash commands do `registry.commands` (name, description, plugin, acceptsArgs, requireAuth) espelhando `/help` do Claude Code; rotas async em `getBduiPage` e síncrona em `buildBduiPage` |
| 2026-07-31 | Página real `hooks` via `buildHooksPage` — `registry.typedHooks` (hookName, pluginId, priority, source) + contagem legacy; espelha hooks do Claude Code/Cline; `bdui-actions.ts` refatorado com helper `reloadHandler` genérico para todas as páginas registry-based (overview, plugins, tools, providers, commands, hooks) |
| 2026-07-31 | Página real `services` via `buildServicesPage` — `registry.services` (id, plugin, hasStop, source) + `registry.gatewayDiscoveryServices` (contagem); expande `reloadHandler` para services |
| 2026-07-31 | Página real `overview` (landing dashboard) via `buildOverviewPage` — métricas reais (agents, plugins loaded, tools, providers, channels configurados) + health card (config valid/issues/warnings, plugins errors, channel registrations, model providers) + quick-links; branch hard-coded removido do `buildBduiPage` (overview agora é async via `getBduiPage`) |
| 2026-07-31 | `AGENTS.md` raiz: seção "BDUI Pages — Concept Parity (2026 products)" documentando paridade conceitual de skills/extensions/providers/channels com Claude Code / Cursor / Cline / n8n / OpenVSX |

## Consequences

- **Positivo:** navegação e rotas não precisam mudar no cliente para novas
  páginas (server-driven); novas funcionalidades exigem só dados no sidecar.
- **Positivo:** `bdui.action` RPC dá paridade entre HTTP e protocolo; ações de
  gestão passam por scopes/auth do gateway.
- **Positivo:** plugins/CLI podem consumir BDUI via `client.bdui.*`.
- **Negativo:** `/ui/*` continua existindo como transporte do desktop enquanto
  não houver motivo para migrar (decisão registrada para não reabrir).
- **Negativo:** páginas reais ainda dependem de dados síncronos do registry
  (config + channels + agents já entraram via `getBduiPage` async); métricas persistidas exigem
  migração de dados antes do Dashboard.
