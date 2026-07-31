# TODO — Migração BDUI + Frontend (Desktop App)

> Backlog de migração das funcionalidades descobertas no inventário
> (`docs/FUNCIONALIDADES-DESKTOP-BDUI.md`) para **BDUI real + frontend**.
> Processo: uma funcionalidade por vez, do sidecar (gateway kairoscode) para a UI (desktop).

## Arquitetura: nativo + offline-first + RPC (sem rotas HTTP)

O app é nativo e deve funcionar **offline**. O desktop sobe o gateway
kairoscode como sidecar local. Transporte do desktop: **HTTP local (loopback)**
via `platform.fetch` + Basic auth (coerente com o client `@kairos-ai/sdk`
HTTP/SSE já usado). Clientes CLI/headless usam **RPC/WebSocket local**
(`client.request("method", params)` — ver `packages/sdk/src/client.ts`).
Logo:

- **Sem HTTP REST** (`/api/v1/*`, `{ success, data }` do `packages/app` não participam).
- **BDUI via server-methods** no protocolo do gateway: `bdui.getPage`, `bdui.registry`, `bdui.action` (criados; `/ui/*` HTTP mantido como transporte do desktop, mas é **fonte de dados**, não contrato REST).
- **Frontend via shell dinâmico**: rota única `/control/:pageId` + nav do registry (`packages/desktop/src/pages/management/*`); o controller BDUI usa `fetch` local (decidido — não migrar para RPC no desktop).
- **Dados em SQLite local** (Drizzle, `*.sql.ts`) dentro do sidecar.
- Serviços externos (LLM, OpenVSX, web search) são opcionais com degradação graciosa offline.

## Como marcar cada item

Cada checkbox de funcionalidade só fecha quando **os 3 passos** estiverem prontos:

- [ ] **Sidecar — server-method `bdui.getPage`**: retorna página real com dados locais (não demo)
- [ ] **Sidecar — server-method `bdui.action`**: actions reais (RPC)
- [ ] **Frontend**: página real servida para o shell dinâmico `/control/:pageId` (rota + nav genéricas já prontas) — o trabalho por página é de **dados**, não de rota/UI

## Legendas

- `[ ]` = pendente · `[x]` = concluído
- **Fase 0**: fundação (destrava tudo) · **Fase 1**: páginas de gestão já existentes no desktop · **Fase 2**: funcionalidades sem página no desktop · **Fase 3**: limpeza/qualidade

---

## Fase 0 — Fundação

- [x] Definir/versionar contrato BDUI (`packages/infra/src/types/bdui.ts`) para páginas de gestão (registry, page, action, data binding) — `BduiPageEntry` e `BduiRegistryEntry.pages` adicionados
- [x] Frontend: shell 100% dinâmico — rota única `/control/:pageId` (redirect `/control` → `/control/overview`), nav montada do registry (`loadBduiRegistry`), renderer BDUI recebe `pageId` da URL
- [x] Criar server-method RPC `bdui.action` no gateway (hoje só existe HTTP `/ui/action`) — schema `BduiActionParams`, validator, allowlists (`method-scopes.ts` WRITE, `server-methods-list.ts`), resolver compartilhado RPC+HTTP (`server/bdui-actions.ts`), fake `toggle.extra` removido
- [x] Expor namespace BDUI no SDK (`packages/sdk`): `BduiNamespace` com `getPage`, `registry`, `action` (`client.bdui.*`)
- [x] **Decisão de transporte**: o controller BDUI do desktop **mantém HTTP local (loopback)** via `platform.fetch` + Basic auth — coerente com o resto do desktop (`@kairos-ai/sdk` é HTTP/SSE; RPC via `@kairos/sdk` fica para clientes CLI/headless, onde `client.bdui.*` já está disponível)
- [ ] Camada de dados Drizzle no kairoscode: migrar entidades do `packages/app` (TypeORM → `*.sql.ts`, snake_case) — projetos, agentes, workflows, skills, tools, vault, settings, observers, tasks, decisões, logs
- [ ] Persistir métricas reais (hoje `MetricsService` é singleton em memória no `packages/app`)
- [ ] Reutilizar auth local do gateway (tokens/device auth) nas server-methods de gestão
- [ ] Remover suporte HTTP de BDUI no gateway (`bdui-http.ts`, `/ui/*`) e o `buildDemoBduiPage` (o fake `toggle.extra` já foi removido)
- [ ] Deprecar `packages/app` (Next.js/TypeORM) — remover dependência do envelope `{ success, data, timestamp }`

## Fase 1 — Páginas de gestão existentes no desktop (nativo quebrado → BDUI)

- [ ] **Dashboard** — métricas do sistema + stats de agentes (`/api/v1/metrics`, `/api/v1/agents/stats`)
  - [ ] Sidecar: `bdui.getPage("dashboard")` com dados reais (shape correto, persistido)
  - [ ] Sidecar: `bdui.action` (ex.: refresh)
  - [ ] Frontend: rota `/control/dashboard` → renderer BDUI
- [x] **Agents** — listar, criar, stats, estado (`agents`, `agents/stats`, `agents/[agentId]/state`)
  - [x] Sidecar: `bdui.getPage` `agents` (lista + model/workspace/default)
  - [ ] Sidecar: `bdui.action` (create, start, pause, delete)
  - [x] Frontend: rota `/control/agents` (shell genérico) → BDUI
- [x] **Projects** — listar/criar (`projects`)
  - [x] Sidecar: `bdui.getPage` `projects` (workspaces derivados de `agents.list[].workspace` + `agents.defaults.workspace`, com contagem de agentes e flag default)
  - [ ] Sidecar: `bdui.action` (create)
  - [x] Frontend: rota `/control/projects` → BDUI
- [ ] **Skills** — listar/gerenciar (`skills`)
  - [ ] Sidecar: `bdui.getPage` `skills`
  - [ ] Sidecar: `bdui.action` (install, update, remove)
  - [ ] Frontend: rota `/control/skills` → BDUI
- [ ] **Tools** — catálogo de ferramentas (`tools`)
  - [x] Sidecar: `bdui.getPage` `tools` (métricas + tabela do `registry.tools`)
  - [x] Sidecar: `bdui.action` `reload` (client-side refetch)
  - [x] Frontend: rota `/control/tools` (shell genérico) → BDUI
- [ ] **Extensions** — OpenVSX (search, install, uninstall, sync, status)
  - [ ] Sidecar: `bdui.getPage` `extensions` com dados reais
  - [ ] Sidecar: `bdui.action` (install, uninstall, enable, disable)
  - [ ] Frontend: rota `/control/extensions` → BDUI
- [x] **Plugins (gateway)** — lista real do `getActivePluginRegistry()` (status, tools, kind, source)
  - [x] Sidecar: `bdui.getPage` `plugins` (métricas loaded/disabled/errors + tabela)
  - [x] Sidecar: `bdui.action` `reload` (client-side refetch) — enable/disable/config ainda pendente
  - [x] Frontend: rota `/control/plugins` (shell genérico) → BDUI
- [ ] **Providers** — modelos/capabilities (`inference/capabilities`, `models`)
  - [x] Sidecar: `bdui.getPage` `providers` (tabela real do `registry.providers`; auth kinds)
  - [ ] Sidecar: `bdui.action` (set provider, API key) — requer acesso a config
  - [x] Frontend: rota `/control/providers` (shell genérico) → BDUI
- [x] **Channels** — integrações/canais (`integrations`, gateway `channels`)
  - [x] Sidecar: `bdui.getPage` `channels` (config snapshot redigido + `registry.channels` — id, enabled, accounts, source)
  - [ ] Sidecar: `bdui.action` (connect, disconnect, start/stop)
  - [x] Frontend: rota `/control/channels` (shell genérico) → BDUI
- [ ] **Memory** — recall/recuperação (`recall/reranked`)
  - [ ] Sidecar: `bdui.getPage` `memory`
  - [ ] Sidecar: `bdui.action` (search, delete)
  - [ ] Frontend: rota `/control/memory` → BDUI
- [ ] **Vault** — credenciais (`vault`, `vault/[key]`)
  - [ ] Sidecar: `bdui.getPage` `vault`
  - [ ] Sidecar: `bdui.action` (set, get, delete)
  - [ ] Frontend: rota `/control/vault` → BDUI
- [ ] **Observers** — eventos e alertas (`observers`, `observers/events`, `observers/alerts`)
  - [ ] Sidecar: `bdui.getPage` `observers`
  - [ ] Sidecar: `bdui.action` (ack, config)
  - [ ] Frontend: rota `/control/observers` → BDUI
- [ ] **Workflows** — CRUD, stats, steps, triggers, history (`workflows/*`)
  - [ ] Sidecar: `bdui.getPage` `workflows`
  - [ ] Sidecar: `bdui.action` (create, update, delete, trigger)
  - [ ] Frontend: rota `/control/workflows` → BDUI
- [x] **Settings** — configurações (`settings`, gateway `config`)
  - [x] Sidecar: `bdui.getPage` `settings` (config snapshot redigido via `redactConfigSnapshot` — path, valid, issues/warnings, providers com baseUrl + modelos)
  - [ ] Sidecar: `bdui.action` (save, reload)
  - [x] Frontend: rota `/control/settings` (shell genérico) → BDUI

## Fase 2 — Funcionalidades sem página no desktop (BDUI + frontend novo)

- [ ] **Auth / Account** — login, signup, me, refresh (`auth/*`)
- [ ] **Workspaces + Membros** (`workspaces`, `workspaces/[workspaceId]/members`)
- [ ] **Tasks** — CRUD, start, complete (`tasks/*`)
- [ ] **Orchestrator** — runs, checkpoints, pause/resume/rollback, execute, plans, policy-audits (`orchestrator/*`)
- [ ] **Benchmarks** + interpretation (`benchmarks`, `benchmarks/interpretation`)
- [ ] **Decisions** — feed/data (`decisions/*`)
- [ ] **Action logs** (`action-logs/*`)
- [ ] **Events** (`events`)
- [ ] **Proactive insights** (`proactive/insights`)
- [ ] **Self-optimization** (`self-optimization`)
- [ ] **Summaries** semânticas (`summaries/semantic`)
- [ ] **Retention policies** + cleanup (`retention-policies/*`)
- [ ] **Snapshots** + restore (`snapshots/*`)
- [ ] **Sync** — status/trigger (`sync/*`)
- [ ] **Inference jobs** (`inference/jobs`)
- [ ] **Segurança** — módulo completo:
  - [ ] Scans + report (`security/scans/*`)
  - [ ] Schedules (`security/schedules/*`)
  - [ ] Webhooks (`security/webhooks/*`)
  - [ ] Simulations (`security/simulations/*`)
  - [ ] Compliance / comprehensive-compliance
  - [ ] Zero-day / ML zero-day
  - [ ] Exploitation tests
  - [ ] Attack chains
  - [ ] API analysis / dangerous patterns
  - [ ] Detailed / infrastructure analysis / package vulnerabilities
- [ ] **Projects — sub-recursos** — context, docs, api-keys, repository-file, repository-insights, decisions (`projects/[projectId]/*`)
- [ ] **Agents — detalhe/estado** (`agents/[agentId]`, `agents/[agentId]/state`)

## Fase 3 — Limpeza e qualidade

- [ ] Remover páginas nativas de gestão do desktop após migração (`pages/management/*.tsx` quebradas)
- [ ] Testes E2E de renderização BDUI (sidecar → desktop, via RPC)
- [ ] Guia de migração para plugins contribuírem páginas BDUI
- [ ] `bun test` / `bun typecheck` verdes no kairoscode e desktop
- [ ] Atualizar `docs/FUNCIONALIDADES-DESKTOP-BDUI.md` e ADR com o estado final

---

## Progresso

| Fase | Total | Feito | Restante |
|---|---|---|---|
| Fase 0 — Fundação | 10 | 5 | 5 |
| Fase 1 — Páginas existentes | 14 | 8 | 6 |
| Fase 2 — Sem página no desktop | 18 | 0 | 18 |
| Fase 3 — Limpeza/qualidade | 5 | 0 | 5 |
