 # Coding Guidelines

 Scope & Safety
 - Tread lightly: keep changes narrowly scoped to the task.
 - No unrelated refactors. If you see an issue, propose it in TODO.md.
 - Keep external APIs stable unless explicitly asked to change them.

 Client (Vite + React + TS)
 - Use functional components and hooks; prefer composition over inheritance.
 - Keep props and state typed; avoid `any`.
 - Co-locate component-specific helpers next to components.
 - Avoid global state unless needed; keep contexts small and focused.

 Server (Node/Express, ESM)
 - Use async/await; return consistent JSON shapes: `{ data, error }`.
 - Validate inputs at route boundaries; sanitize external data.
 - Centralize side-effects (DB, network) in services/controllers.
 - Log actionable context; avoid leaking secrets.

 Error Handling
 - Fail fast with clear messages; prefer early returns.
 - Map known errors to 4xx; unknown to 500 with safe message.

 Formatting & Naming
 - Use consistent 2-space indentation; keep lines readable (< 100 chars when possible).
 - Descriptive names over comments: `getExpiredTrades`, `fetchOptionChain`, etc.
 - Keep files focused; consider splitting after ~300–400 LOC.

 Dependencies
 - Avoid adding deps without approval. Prefer standard libs or existing deps.

 Docs
 - Update `.codex/` files when behavior or process changes.
 - Note intentional trade-offs in DECISIONS.md.
