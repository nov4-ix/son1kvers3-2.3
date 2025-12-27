<!-- Copilot / AI agent instructions for contributors and coding agents -->
# Copilot Instructions — Super‑Son1k (monorepo)

This file gives immediate, actionable context for AI coding assistants working in this repository. It is a concise, discoverable summary of the project's structure, critical conventions, and common developer workflows.

1) Big picture
- Monorepo (pnpm workspaces, Turborepo): multiple `apps/` (Next.js / React) and `packages/` (backend, shared-ui, shared-utils, shared-types).
- Backend: `packages/backend` — Fastify + Prisma + BullMQ token/job system. Frontends live under `apps/` (notably `the-generator-nextjs` and `ghost-studio`).
- Token pool: backend manages external API tokens (Suno) via a unified token pool. Token health, rotation and stats endpoints (eg. `/api/tokens/stats`) are central to generation flows.

2) Where to look first (files that explain intent)
- Top-level `README.md` — project overview, commands, and architecture notes.
- `packages/backend/` — implementation of services, routes, Prisma schema and token manager.
- `.cursorrules` and `.cursor/rules/son1kvers3.mdc` — project-specific rules (audio store, env usage, strict types).
- `env.example` and app-specific `env.local` examples — required environment variables (DB, Redis, JWT, SUPABASE, SUNO_API_*).

3) Important conventions and gotchas (copyable rules)
- Audio: always use the global audio store (example path: `apps/*/src/store/audioStore.ts`) — never create multiple Audio instances; revoke object URLs and close AudioContext on unmount.
- Env: prefer the repository `config` helper (eg. `src/lib/config/env.ts`) instead of reading `import.meta.env` directly; env is validated at startup.
- Types: use strict TypeScript, avoid `any`. Shared types live in `packages/shared-types` and API types in `src/types/api.ts`.
- State & server patterns: frontends use Zustand for local stores and React Query for server state. Backend routes live in `packages/backend/src/routes` and services in `packages/backend/src/services`.

4) Common commands (copy/paste)
- Install: `pnpm install`
- Dev (root): `pnpm dev` (runs turborepo/pnpm filters)
- Run backend only: `pnpm --filter @son1k-2.0/backend dev` (or from `packages/backend`: `pnpm dev`)
- Prisma (backend):
  - `cd packages/backend`
  - `pnpm prisma generate`
  - `pnpm prisma migrate dev --name init` or `pnpm prisma db push`
  - `pnpm prisma studio`
- Health check (debugging): `curl <BACKEND_URL>/health` — expected JSON includes `services.database` and `tokenPoolSize`.

5) Debugging tips & frequent issues
- Database connections: for quick local runs backend supports SQLite (`DATABASE_URL=file:./dev.db`) — see `BACKEND_DEPLOYMENT_GUIDE.md`.
- CORS issues: set `FRONTEND_URL` env to include all app origins, then restart deployment.
- Token validation: token pool is source of truth for Suno API calls — mocks may be used in dev. Check `/api/tokens/stats` for pool health.
- Logs: watch Vercel/Railway dashboards or run `pnpm dev` and inspect backend stdout. Use Prisma Studio to inspect DB state.

6) Safe edit patterns for AI agents
- Make minimal, focused changes. Prefer adding a new backend service under `packages/backend/src/services/` or an API route under `packages/backend/src/routes/` rather than refactoring widely.
- Update shared types in `packages/shared-types` when changing API shapes; run `pnpm build` and `pnpm type-check` after edits.
- Add tests under the package that changed and run `pnpm --filter <pkg> test` locally.

7) Examples to reference when generating code
- Token manager & pool: inspect `packages/backend/src/services/tokenPool*` (search for "token pool" or "Suno").
- Job queue / async generation: look for BullMQ usage in `packages/backend/src/services/` and routes that enqueue generation tasks.
- Audio store usage: open `apps/*/src/store/audioStore.ts` and components that call `useAudioStore()` to ensure you follow the single-audio rule.

8) Things NOT to change without human review
- Global authentication flows (Supabase + JWT) in `packages/backend/src/middleware`.
- Database schema in `packages/backend/prisma/schema.prisma` — migrations must be planned.
- Token rotation and storage logic — high risk for production outages if changed incorrectly.

9) If you need more context
- Read `BACKEND_DEPLOYMENT_GUIDE.md` for production and deployment-specific envs and steps.
- Browse `README.md` at root for project-level commands and architecture rationale.

If anything here is unclear or you want me to expand/condense sections, tell me which part to revise. I'll iterate quickly.
