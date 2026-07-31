# ADR: Backend-Driven UI (BDUI) Migration

**Date:** 2026-07-30
**Status:** Accepted — In Progress

## Context

O projeto Kairos possui múltiplas superfícies de UI (Control UI Lit, Desktop SolidJS,
Web Next.js, apps nativos iOS/Android/macOS). Cada uma implementa sua própria lógica
de renderização, levando a duplicação de componentes, inconsistências visuais e
manutenção cara. Não há um schema unificado que permita ao servidor definir a UI
que o cliente deve renderizar.

## Decision

Migrar para uma arquitetura **Backend-Driven UI (BDUI)** onde o servidor define
a estrutura, os componentes, os dados e as ações da UI através de um schema JSON
declarativo. O cliente se torna um **renderizador universal** que mapeia o schema
para componentes nativos.

## Schema

O schema BDUI segue a versão `bdui/v1` e é composto por:

- **BduiPage** — definição completa de uma tela (layout + contexto + estado)
- **BduiLayout** — estrutura da página (page, section, dialog, panel)
- **BduiComponent** — componente de UI com type, props, children, actions, conditions, style, data binding
- **BduiAction** — ação declarativa (navigate, api, command, dispatch, link, callback)
- **BduiDataExpression** — binding reativo a state/data/context/response
- **BduiActionResponse** — resposta a uma ação com patch de estado, toast, navegação
- **BduiComponentRegistration** — registro de componentes por plugins

## Component Registry

- Built-in components são registrados no core do servidor
- Plugins registram componentes via `api.registerBduiComponent()` no Plugin SDK
- O registry serve tanto o Gateway Protocol quanto endpoints HTTP REST

## Data Flow

```
Plugin/Core registra componente → BDUI Registry
Cliente solicita página → Servidor monta BduiPage do registry
Cliente renderiza página → Mapeia schema para componentes nativos
Interação do usuário → BduiAction → Servidor → BduiActionResponse (patch/state)
```

## Status

| Fase | Status |
|------|--------|
| Schema BDUI (tipos + TypeBox) | ✅ |
| Component Registry (Plugin SDK) | ✅ |
| Endpoints HTTP (`/ui/*`) | ✅ |
| Gateway Protocol (`bdui.getPage`, `bdui.registry`) | ✅ |
| Motor de renderização (Lit) | ✅ |
| Controller BDUI (page fetcher + action dispatcher) | ✅ |
| Componente host `<bdui-page>` + aba `bdui` no Control UI | ✅ |
| Página de exemplo server-driven (`bdui-pages.ts`) nos handlers HTTP/RPC | ✅ |
| Integração com Control UI Bootstrap | ✅ |
| Renderer nativo SolidJS no Desktop (`packages/desktop/src/bdui/`) | ✅ |
| Migração de superfícies existentes | 📝 |

## Changelog

| Data | Mudança |
|------|---------|
| 2026-07-30 | Schema BDUI (`bdui/v1`), Component Registry, endpoints HTTP, Gateway RPC |
| 2026-07-30 | Renderizador Lit (22 tipos: text, heading, badge, button, input, select, checkbox, toggle, textarea, card, table, stack, row, separator, spinner, metric, image, avatar, link, tabs, form, container) |
| 2026-07-30 | Controller BDUI (`packages/ui/src/ui/controllers/bdui.ts`) — page fetcher, action dispatcher, state patch, registry loader |
| 2026-07-30 | ADR inicial |
| 2026-07-31 | Controller BDUI alinhado aos tipos do `@kairos/infra` (single source of truth) |
| 2026-07-31 | Componente host Lit `<bdui-page>` (`packages/ui/src/ui/components/bdui-page.ts`) renderizado na aba `bdui` do Control UI (via `app-render.ts`) |
| 2026-07-31 | Página de exemplo `buildDemoBduiPage` (`bdui-pages.ts`) wireada nos handlers HTTP (`GET /ui/page/:id`) e RPC (`bdui.getPage`) |
| 2026-07-31 | Fix: `BduiComponentSchema` migrado de `Type.Recursion` (inexistente no typebox v1) para `Type.Cyclic` (`$defs` + `$ref`) — o módulo do protocolo não carregava em runtime |
| 2026-07-31 | Testes de schema/validators BDUI e página demo (`bdui.schema.test.ts`) |
| 2026-07-31 | Renderer nativo SolidJS no Desktop: `src/bdui/` (controller agnóstico, `renderer.tsx` com os 22 tipos, `page.tsx` host) + rota `/management/bdui` |
| 2026-07-31 | Alias `@infra` no Desktop (tsconfig + vite) para consumir `packages/infra/src/types/bdui.ts` como single source of truth |
| 2026-07-31 | Handler de ação demo no servidor (`POST /ui/action` → estado `toggle.extra`) para a página `overview` |
| 2026-07-31 | Fix Desktop: controller BDUI usa `platform.fetch` (tauriFetch) em vez de `globalThis.fetch` — o webview Tauri bloqueia por CORS o fetch cross-origin aos endpoints `/ui/*` |
| 2026-07-31 | Shell dinâmico no Desktop + `bdui.action` RPC + transporte HTTP loopback — ver ADR `2026-07-31-bdui-desktop-shell-offline-first.md` |

## Consequences

- **Positivo:** UI consistente entre plataformas; plugins definem UI própria sem tocar no cliente
- **Positivo:** Mudanças de UI não requerem deploy de cliente (over-the-air)
- **Positivo:** Redução de código duplicado entre superfícies
- **Negativo:** Cliente precisa de um motor de renderização genérico
- **Negativo:** Latência adicional para buscar definições de UI do servidor
- **Negativo:** Complexidade do schema versioning
