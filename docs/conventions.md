# Conventions

## Domain module

Every domain is the same six files. Copy an existing domain; don't invent a shape.

```
src/domains/<domain>/
  schema.ts    Drizzle tables
  types.ts     Zod schemas — source of truth for this domain's shapes
  service.ts   Business logic; the only file that touches the database
  routes.ts    Hono routes — parse, call service, return
  tools.ts     AI tool definitions wrapping service functions
  index.ts     Exports routes + tools
```

| Rule | Consequence |
|---|---|
| `routes.ts` and `tools.ts` both call `service.ts`; neither touches the DB | Every AI capability is reachable over HTTP, and the reverse |
| Zod schemas live in `types.ts`, reused for HTTP validation and tool schemas | They can't drift — same object |
| Domains never import another domain's internals | Cross-domain goes through exported services or `shared/links` |

## Git

| Topic | Convention |
|---|---|
| Branching | Trunk-based on `main`. Branch only for spikes that may be thrown away. |
| Messages | Conventional Commits, scoped by domain — `feat(tasks):`, `fix(finance):`, `chore(ci):` |
| Frequency | Whenever a slice works; several times a day. Small commits are the undo history. |
| Signing | Automatic via `commit.gpgsign` + SSH key in 1Password. No `-S` flag needed. |

## Migrations

- Drizzle migrations are committed.
- Never edit a migration already applied to the Pi — write a new one.
- Migrations run on deploy, not on app boot.

## UI

| Topic | Convention |
|---|---|
| Components | shadcn/ui is copied into the repo. Edit freely; there is no upstream to track. |
| Mobile | Defaults read desktop-first. Size touch targets deliberately; prefer `vaul` drawers over dialogs. |
| State | Server state via TanStack Query. Treat the client as a cache — iOS may evict PWA storage. |

## Documentation

Three kinds, three lifespans. Keeping them in one file is what makes docs rot.

| Kind | Example | Lifespan |
|---|---|---|
| Descriptive | Module layout, schema shapes | **Delete** as the code appears |
| Normative | "Domains never import each other's internals" | Permanent — convert to a lint rule or test where possible |
| Rationale | Why Hono over Fastify | Permanent — lives in `decisions.md` |

> Anything derivable by reading the code should not be written down. It drifts
> silently, then misleads.

Transient directives — what to build next, current focus — go in the `## Status`
block of `CLAUDE.md` and nowhere else. Never in this file.
