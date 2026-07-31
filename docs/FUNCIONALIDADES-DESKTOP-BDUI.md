# Funcionalidades — Inventário, Status BDUI e Gaps do Desktop

> Última atualização: 2026-07-31
> Fonte: inventário do código (rotas `/api/v1` do `packages/app`, server-methods e HTTP do gateway `packages/kairoscode`, páginas do `packages/desktop`).

## Contexto de arquitetura (3 servidores/camadas distintos)

> **Decisão (2026-07-31):** o app é **nativo e offline-first**. Comunicação com o
> sidecar é via **RPC/WebSocket local** (`client.request("method", ...)`, ver
> `packages/sdk/src/client.ts`). **Sem rotas HTTP** (`/api/v1/*`, `/ui/*`, envelope
> `{ success, data, timestamp }` não participam). BDUI via **server-methods**
> (`bdui.getPage`, `bdui.registry` — já existem; `bdui.action` — criar). Dados em
> SQLite local (Drizzle) no sidecar. O `packages/app` é legado a deprecar.

| Camada | Pacote | Papel | Observação |
|---|---|---|---|
| Sidecar/CLI | `packages/kairoscode` | Gateway Bun/Effect que o desktop sobe como sidecar (`kairos ... serve`) | Fonte de verdade do produto principal (chat/sessões). Já tem Drizzle (`.sql.ts`) e BDUI infra |
| App legado | `packages/app` | Next.js + TypeORM + SQLite (`~/.Kairos/data.sqlite`) | **Não** é servido no app Windows. A deprecar (dados migram para o sidecar) |
| Desktop | `packages/desktop` | Tauri + SolidJS | Consome o gateway via SDK (RPC). Páginas de gestão BDUI via SDK |

Legenda de status no desktop:

- **Nativo** — página SolidJS dedicada, mas **quebrada** (mismatch de contrato, ver nota).
- **BDUI** — renderizada pelo renderer BDUI (server-driven).
- **BDUI-demo** — renderizada via BDUI, porém com dados falsos.
- **Ausente** — sem qualquer página no desktop.

> **Nota de contrato (crítica):** o `packages/app` envolve toda resposta em `{ success, data, timestamp }` (`app/api/_lib/response.ts`). As páginas do desktop fazem `r.json()` e leem campos **diretamente** (`projects.tsx:18`, `dashboard.tsx:37-42`, etc.). Resultado: **todas as páginas de gestão nativas estão quebradas** (renderizam `undefined` ou iteram o envelope, não o array). Além disso o shape de `/api/v1/metrics` (`uptime`/`memory`/`loadAvg`/`threads`) não bate com o que o dashboard espera (`uptimeDays`/`memUsedMb`/`cpuLoad`/...).

---

## 1. Funcionalidades presentes

### 1.1 Produto principal — chat/sessões (gateway `kairoscode`, funciona)

O desktop já usa isso pelo SDK + WebSocket/RPC do gateway.

| Funcionalidade | Onde (server-methods) | Status no desktop |
|---|---|---|
| Chat/sessão (composer, timeline, follow-up, perguntas, permissões, todos, revert) | `sessions`, `session`, `send`, `chat`, `approval` | Nativo (funciona) |
| Terminal, review, file tabs, side panel | — (UI pura) | Nativo |
| Agentes (listar/criar/mutate/estado) | `agents`, `agent`, `agent-job` | Nativo |
| Canais/Integrações | `channels` | Nativo (quebrado: página `channels.tsx` aponta `/api/v1/integrations` do packages/app) |
| Skills (ClawHub) | `skills`, `tools-catalog`, `tools-effective` | Nativo |
| Comandos (slash) | `commands`, `cron` | Nativo |
| Config / Segredos / Credenciais | `config`, `secrets`, `credentials` | Nativo |
| Modelos / Providers | `models`, `models-auth-status` | Nativo (quebrado: `providers.tsx` usa `/api/v1/inference/capabilities` do packages/app) |
| Uso/custo | `usage` | Nativo |
| Saúde / Doctor / Diagnostics | `health`, `doctor`, `diagnostics` | Nativo |
| Dispositivos / Conexão / Push / Logs / Update / Restart / TTS | `devices`, `connect`, `push`, `logs`, `update`, `restart-request`, `tts` | Nativo |
| Nodes (invoke/wake) | `nodes` | Nativo |
| API compatível OpenAI (`/v1/models`, `/v1/chat/completions`, `/v1/responses`, `/v1/embeddings`) | `openai-http`, `openresponses-http`, `models-http`, `embeddings-http` | — (API externa) |
| MCP (`/.well-known`) | `mcp-http.request` | — (API externa) |
| Plugins (runtime + HTTP) | `plugins-http`, `plugin-approval`, `plugin-host-hooks` | Nativo |
| Auth do gateway (tokens, device auth, rate-limit) | `auth*`, `device-auth` | Nativo |

### 1.2 BDUI (infra existe; conteúdo é demo)

| Funcionalidade | Onde | Status |
|---|---|---|
| Renderer BDUI SolidJS | `packages/desktop/src/bdui/renderer.tsx` | BDUI (shell pronto) |
| Página de controle `/control/:pageId` (rota genérica) | `packages/desktop/src/pages/management/bdui.tsx`, `app.tsx`, `layout.tsx` | BDUI (shell dinâmico — nav vem do registry) |
| Contrato de tipos (single source of truth) | `packages/infra/src/types/bdui.ts` | BDUI (infra) |
| Registry de componentes BDUI de plugins | gateway `bdui.registry` (server-method) + `getActivePluginRegistry().bduiComponents` | BDUI (infra real) |
| RPC `bdui.getPage` | `packages/kairoscode/.../server-methods/bdui.ts:44` | BDUI-demo (`buildDemoBduiPage`) |
| RPC `bdui.action` | **não existe** — hoje só HTTP `POST /ui/action` | A criar |
| HTTP `/ui/registry`, `/ui/page/*`, `/ui/action` | `packages/kairoscode/.../server/{bdui-http,bdui-pages}.ts` | BDUI-demo — **remover** (app é RPC, não HTTP) |
| Controller BDUI no desktop usa `fetch` HTTP | `packages/desktop/src/bdui/controller.ts:25-54` | Trocar para RPC via SDK |

### 1.3 Gestão — API do `packages/app` (`/api/v1/*`, Next.js + TypeORM)

> **Nenhuma dessas funcionalidades é BDUI.** E, no app Windows, **não estão acessíveis** (o sidecar é o kairoscode, que não serve `/api/v1/*`).

#### Autenticação e organização
- Auth: login, signup, me, refresh (`auth/*`)
- Workspaces + membros (`workspaces`, `workspaces/[workspaceId]/members`)
- Projetos: CRUD (`projects`)

#### Agentes, tarefas e execução
- Agentes: CRUD, stats, estado (`agents`, `agents/[agentId]`, `agents/[agentId]/state`)
- Tasks: CRUD, start, complete (`tasks`, `tasks/[taskId]/start`, `tasks/[taskId]/complete`)
- Orchestrator: runs (execute/pause/resume/rollback/checkpoints/tasks), plans, policy-audits (`orchestrator/*`)
- Action logs (`action-logs`, `action-logs/[pipelineId]`)

#### Fluxo de trabalho e conhecimento
- Workflows: CRUD, stats, steps, triggers, history (`workflows/*`)
- Skills (`skills`)
- Tools (`tools`)
- Memory/Recall: reranked (`recall/reranked`)
- Decisions: feed/data (`decisions/*`)
- Summaries semânticas (`summaries/semantic`)
- Projetos: context, docs, api-keys, decisions, repository-file, repository-insights (`projects/[projectId]/*`)

#### Infraestrutura e observabilidade
- Metrics (`metrics`)
- Observers: eventos e alertas (`observers`, `observers/events`, `observers/alerts`)
- Events (`events`)
- Settings (`settings`)
- System: bootstrap, ai-availability (`system/*`)
- FS browse (`fs/browse`)
- Sync: status/trigger (`sync/*`)
- Snapshots + restore (`snapshots/*`)
- Retention policies + cleanup (`retention-policies/*`)

#### Integrações e extensões
- Integrations/channels (`integrations`, `integrations/[id]`)
- Inference: capabilities, jobs (`inference/*`)
- Extensions/OpenVSX: search, install, uninstall, sync, status, runtime, installed, ui/render, readme, compat (`extensions/open-vsx/*`)
- Vault (`vault`, `vault/[key]`)

#### Inteligência e segurança
- Benchmarks + interpretation (`benchmarks/*`)
- Proactive insights (`proactive/insights`)
- Self-optimization (`self-optimization`)
- Security: scans+report, schedules, webhooks, simulations, compliance, comprehensive-compliance, zero-day, ml-zero-day, exploitation-tests, attack-chains, api-analysis, dangerous-patterns, detailed-infrastructure, infrastructure-analysis, package-vulnerabilities (`security/*`)

---

## 2. Status BDUI no desktop

> **Estado atual (2026-07-31):** o frontend de controle virou **shell dinâmico**.
> Uma rota genérica `/control/:pageId` renderiza o renderer BDUI com o `pageId`
> vindo da URL; a **sidebar é montada a partir do registry** (`bdui.registry`,
> lista de `pages`). Páginas nativas de gestão foram desrotadas (dead code).

| Rota do desktop | Renderiza | Status |
|---|---|---|
| `/control/:pageId` | `bdui.tsx` → `<BduiPage pageId={params.pageId}>` | **BDUI** (shell genérico) |
| `/control` (redirect) | → `/control/overview` | BDUI |
| Nav lateral | `layout.tsx` → `loadBduiRegistry()` | **Dinâmico** (server-driven) |
| `/session/*` | `session/**` | Nativo (funciona) |

**Conteúdo das páginas BDUI:** ✅ **Plugins**, **Tools** e **Providers** são
páginas reais (dados do `getActivePluginRegistry()`: métricas + tabelas com
status, tools, kind, auth). As demais páginas ainda usam a demo (`buildBduiPage`
com fallback "unknown page") — **as funcionalidades restantes não têm BDUI real
ainda**. As páginas nativas (`dashboard.tsx`, `agents.tsx`, etc.) estão quebradas
(envelope `{success,data}` + shape de metrics) e agora são **dead code**,
substituídas pela rota genérica.

> Decisões de arquitetura (shell dinâmico, `bdui.action` RPC, transporte HTTP
> loopback) documentadas em `docs/adr/2026-07-31-bdui-desktop-shell-offline-first.md`.

---

## 3. O que falta implementar no desktop app

### 3.1 Crítico (desbloqueia tudo)
1. **BDUI real via RPC substituindo as páginas nativas de gestão** — server-methods `bdui.getPage`/`bdui.registry` com dados reais (não `buildDemoBduiPage`). ✅ `bdui.action` (RPC) criado (schema `BduiActionParams`, allowlists WRITE/list, resolver compartilhado `server/bdui-actions.ts`); fake `toggle.extra` removido.
2. **Controller BDUI do desktop** — ✅ shell dinâmico pronto (`/control/:pageId`, nav via `loadBduiRegistry`). ✅ **Decisão**: manter HTTP local (loopback) via `platform.fetch` + Basic auth como transporte oficial; RPC via `client.bdui.*` fica para clientes CLI/headless.
3. **Fonte de verdade única offline** — dados migrados para o sidecar kairoscode (Drizzle local); `packages/app` deprecado (o envelope `{success,data}` deixa de existir).

### 3.2 Dados
4. **Migrar entidades TypeORM → Drizzle** no kairoscode (padrão já estabelecido: `*.sql.ts`, snake_case). O gateway já tem `project`, `session`, `account`, `workspace`, `storage`, `share`, `event`.
5. **Persistir métricas** — hoje `MetricsService` (packages/app) é singleton em memória (`MetricsService.ts:77`); reiniciou = zerou.

### 3.3 Funcionalidades de gestão do `packages/app` **sem página** no desktop (candidatas a BDUI)
- **Segurança** (scans, schedules, webhooks, simulations, compliance, zero-day, exploitation-tests, attack-chains, api-analysis, dangerous-patterns, detailed-infrastructure, infrastructure-analysis, package-vulnerabilities) — módulo inteiro sem UI
- **Orchestrator** (runs, plans, policy-audits, checkpoints)
- **Benchmarks** (+ interpretation)
- **Tasks**
- **Decisions** (feed/data)
- **Action logs**
- **Events**
- **Proactive insights**
- **Self-optimization**
- **Summaries** (semantic)
- **Retention policies** (+ cleanup)
- **Snapshots** (+ restore)
- **Sync** (status/trigger)
- **Inference jobs**
- **Workspaces/members**
- **Projetos — sub-recursos** (context, docs, api-keys, repository-file, repository-insights)
- **Agents — detalhe/estado** (agents/[agentId], state)
- **Auth/account** (login/signup/me/refresh — hoje só ConnectionGate + selection de server)

### 3.4 Qualidade
6. **Auth das server-methods de gestão** — reutilizar auth local do gateway (tokens, device auth, rate-limit).
7. **Validação** — `bun test`/`bun typecheck` não rodam localmente (faltam `node_modules`; preload do bunfig falha). Precisa de ambiente de CI/paridade para o kairoscode.

---

## 4. Roadmap sugerido (ordem)

| Fase | Ação | Resultado |
|---|---|---|
| 0 | RPC-only: criar `bdui.action`, expor `bdui.*` no SDK, trocar controller do desktop para RPC; migrar dados (TypeORM → Drizzle); persistir métricas; remover HTTP `/ui/*` e demo | Offline-first, um sidecar, dados reais persistidos |
| 1 | Server-methods `bdui.getPage`/`bdui.action` reais (dados locais) — ex.: dashboard | BDUI real mínimo via RPC |
| 2 | Trocar páginas nativas por BDUI uma a uma; remover páginas quebradas | Gestão 100% BDUI offline |
| 3 | Deprecar `packages/app` | Fim das duas fontes de verdade |
| 4 | `bun test`/typecheck verdes + auth nas server-methods de gestão | Qualidade/2026 |
