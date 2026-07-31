- To regenerate the JavaScript SDK, run `./packages/sdk/js/script/build.ts`.
- ALWAYS USE PARALLEL TOOLS WHEN APPLICABLE.
- The default branch in this repo is `dev`.
- Local `main` ref may not exist; use `dev` or `origin/dev` for diffs.
- Prefer automation: execute requested actions without confirmation unless blocked by missing info or safety/irreversibility.

## Style Guide

### General Principles

- Keep things in one function unless composable or reusable
- Avoid `try`/`catch` where possible
- Avoid using the `any` type
- Use Bun APIs when possible, like `Bun.file()`
- Rely on type inference when possible; avoid explicit type annotations or interfaces unless necessary for exports or clarity
- Prefer functional array methods (flatMap, filter, map) over for loops; use type guards on filter to maintain type inference downstream
- In `src/config`, follow the existing self-export pattern at the top of the file (for example `export * as ConfigAgent from "./agent"`) when adding a new config module.

Reduce total variable count by inlining when a value is only used once.

```ts
// Good
const journal = await Bun.file(path.join(dir, "journal.json")).json()

// Bad
const journalPath = path.join(dir, "journal.json")
const journal = await Bun.file(journalPath).json()
```

### Destructuring

Avoid unnecessary destructuring. Use dot notation to preserve context.

```ts
// Good
obj.a
obj.b

// Bad
const { a, b } = obj
```

### Variables

Prefer `const` over `let`. Use ternaries or early returns instead of reassignment.

```ts
// Good
const foo = condition ? 1 : 2

// Bad
let foo
if (condition) foo = 1
else foo = 2
```

### Control Flow

Avoid `else` statements. Prefer early returns.

```ts
// Good
function foo() {
  if (condition) return 1
  return 2
}

// Bad
function foo() {
  if (condition) return 1
  else return 2
}
```

### Schema Definitions (Drizzle)

Use snake_case for field names so column names don't need to be redefined as strings.

```ts
// Good
const table = sqliteTable("session", {
  id: text().primaryKey(),
  project_id: text().notNull(),
  created_at: integer().notNull(),
})

// Bad
const table = sqliteTable("session", {
  id: text("id").primaryKey(),
  projectID: text("project_id").notNull(),
  createdAt: integer("created_at").notNull(),
})
```

## BDUI Pages — Concept Parity (2026 products)

BDUI pages (`bdui.getPage` no sidecar kairoscode, servidas ao shell dinâmico do
desktop em `/control/:pageId`) devem refletir os conceitos de produtos
similares de 2026, não inventar terminologia ou semântica própria. Antes de
implementar uma página, confirme a paridade conceitual abaixo; se houver gap,
alinhe ao padrão de mercado, não crie um termo novo.

### Skills

- **Modelo de referência (2026):** Claude Skills (`SKILL.md` em
  `~/.claude/skills/` ou `.claude/skills/`), Cursor rules, Cline rules,
  Gemini CLI `GEMINI.md`.
- **Semântica:** uma Skill é um **pacote de instruções markdown** com
  frontmatter (`name`, `description`, opcionalmente `allowed-tools`), que
  estende o comportamento de um agente em um escopo (global / projeto /
  plugin). Não é código executável; é contexto/instrução injetável
  on-demand pelo agente.
- **Na BDUI page `skills`:** liste Skills como o Claude Code lista —
  `name`, `description`, escopo (`global`/`project`/`plugin`), source
  (caminho ou plugin), enabled/disabled. Actions: `install`, `update`,
  `remove` espelham `claude skills install|remove` / Cursor cmd. **Não**
  trate Skills como ferramentas (tools) — elas não são invocáveis, são
  interpretadas pelo agente.
- **Fonte dos dados:** descoberta de `SKILL.md` em `skills/` de plugins
  (manifest `skills` arrays) + paths de config (`skills.paths`) + URLs
  (`skills.urls`), resolução de frontmatter. Não invente um registry
  separado; reúso o discovery de skills existente.

### Extensions

- **Modelo de referência (2026):** VS Code / OpenVSX extensions (plugins
  runtime), Cursor extensions, Claude Code MCP installs.
- **Semântica:** uma Extension é um **pacote instalável** de um registry
  público (OpenVSX / VS Code Marketplace), versionado, com
  enable/disable/uninstall. Diferente de plugin nativo kairos, é uma
  unidade de distribuição, não de runtime.
- **Na BDUI page `extensions`:** search (query OpenVSX), lista de
  instalados (id, version, enabled), install/uninstall,
  enable/disable/sync. Espelha a UX da paleta de extensões VS Code /
  Cursor.
- **Fonte dos dados:** cliente OpenVSX já usado pelo desktop
  (`/api/v1/extensions/open-vsx/search`); estado de instalação em
  `~/.kairos/extensions/` ou equivalente.

### Providers

- **Modelo de referência (2026):** Anthropic/OpenAI/Google model
  pickers, Cursor "Models" settings, Cline "API Providers", LM Studio
  local endpoints, OpenRouter aggregator.
- **Semântica:** um Provider é uma **origem de inferência LLM** com auth
  (API key / OAuth / local), baseUrl, catálogo de modelos e
  capabilities (context window, thinking, vision, tool-use).
- **Na BDUI page `providers`:** liste como Cursor/Cline — `id`, `label`,
  `source` (plugin), `auth kind`, modelos disponíveis, modelo padrão
  marcado. Actions: `set provider`, `set API key` (via config/secret),
  `set default model`. Não confunda com "Models" isolados — provedor é
  o container, modelo é a entry dentro dele.
- **Fonte dos dados:** `registry.providers` já exposto; config
  `models.providers` para baseUrl + modelos configurados.

### Channels

- **Modelo de referência (2026):** n8n / Make integrations, Slack/Discord
  bot onboarding flows, Whatsapp Business API connect, Telegram BotFather
  flows, Linear/GitHub webhook configs.
- **Semântica:** um Channel é uma **integração de mensageria de entrada
  /saída** (Discord, Telegram, Slack, etc.) com contas conectadas, estado
  de conexão, gating (allowlist, menção em grupo), e mapeamento
  canal→modelo/agente.
- **Na BDUI page `channels`:** liste como n8n/Linear settings —
  `id`, `label`, `source` (builtin/plugin), `enabled`, `accounts`
  (quantidade conectada), status de cada conta. Actions: `connect`,
  `disconnect`, `start`/`stop`, `set model per channel`. Espelha o
  "Connections" do n8n / "Integrations" do Linear.
- **Fonte dos dados:** `registry.channels` + `config.channels` (redigido
  via `redactConfigSnapshot`).

### Regras gerais de paridade

- **Terminologia:** use os termos que o usuário 2026 reconhece do Claude
  Code / Cursor / Cline / n8n. Não invente sinônimos (`skills` ≠
  `commands`, `extensions` ≠ `plugins`, `providers` ≠ `models`).
- **Dados reais:** toda página BDUI serve dados do sidecar (registry /
  config / SQLite), nunca dados demo ou hard-coded. Se uma página não
  tem fonte de dados real, ela não entra no registry até ter.
- **Não duplicar conceitos:** uma entidade conceitual = uma página. Se
  "tools" e "skills" parecem sobrepostos, lembre: tools são código
  invocável pelo agente; skills são instruções markdown interpretadas.
  Mantenha-os em páginas separadas como o Claude Code mantém.
- **Offline-first:** páginas devem renderizar sem rede (OpenVSX é
  opcional com degradação graciosa para `extensions`). Métricas que
  exigem rede externa devem marcar o estado "unavailable" em vez de
  falhar.
- **Redação de secrets:** qualquer página que toque config usa
  `redactConfigSnapshot` — nunca exponha tokens, API keys, ou
  `accounts` com credenciais brutas. Espelha o padrão da página
  `settings` já implementada.

## Testing

- Avoid mocks as much as possible
- Test actual implementation, do not duplicate logic into tests
- Tests cannot run from repo root (guard: `do-not-run-tests-from-root`); run from package dirs like `packages/kairos`.

## Type Checking

- Always run `bun typecheck` from package directories (e.g., `packages/kairos`), never `tsc` directly.
