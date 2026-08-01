# Web package notes

- `apps/web` is the 100% TypeScript web client (SolidJS + Vite). There is no native shell.
- The entrypoint is `src/entry.tsx`; it connects to the gateway over HTTP. See `src/entry.tsx` for how the default server URL is resolved.
- Never depend on `@tauri-apps/*` or any other non-web runtime in this package.
