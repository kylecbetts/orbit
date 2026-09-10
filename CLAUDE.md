# Orbit

Personal life-organization system with AI acting within and across domains.
Single user, used from iPhone, iPad, and desktop.

Domains: Tasks, Finance, Wardrobe, Fitness, Nutrition, Career, Shopping — more
later. Cross-domain intelligence is the point: one database, one agent.

## Status

Greenfield. Only this file exists.

**Now:** ship Tasks end-to-end — schema → API → PWA → one AI tool — before
starting any other domain.

> Transient section. Edit it; don't let it accumulate.

## Stack

| Layer | Choice |
|---|---|
| Language | TypeScript everywhere |
| Web | Vite · React · TanStack Router/Query · shadcn/ui · Tailwind · `vite-plugin-pwa` |
| API | Hono |
| DB | Postgres · Drizzle |
| AI | LLM behind a provider-agnostic interface |
| Host | Raspberry Pi 5 · Docker Compose · Caddy · Tailscale |
| Domain | `*.kylebetts.net` — Cloudflare DNS, wildcard cert via DNS-01 |

## Hard rules

| Rule | Why | Enforced |
|---|---|---|
| One agent holding all tools — no per-domain agents behind an orchestrator | Subagent summaries destroy cross-domain insight | Review |
| Agent runs are rows in a table, not request handlers | Scheduled AI later is a cron entry, not a refactor | Review |
| AI writes are proposals until confirmed | It writes to money and health data | Review |
| Plain Docker + plain Postgres — no edge runtimes, no platform SDKs | Pi → VPS stays a weekend | Review |
| No auth code | Tailscale is the authentication boundary | — |
| No multi-tenancy — no `user_id`, orgs, or roles | One user, forever | — |

## Layout

```
src/
  domains/<domain>/   one directory per domain — see docs/conventions.md
  shared/             links (cross-domain relations), events (activity log)
  ai/                 agent runner, tool registry, providers/
  db/                 Drizzle client + migrations
  server.ts
web/                  Vite React PWA
docs/                 conventions, decisions
```

## Reference

| File | Contents |
|---|---|
| `docs/conventions.md` | Domain module shape, commits, migrations, UI |
| `docs/decisions.md` | What was chosen, what was rejected, why |

## Priority

Capture friction kills this project; architecture doesn't. Given a choice between
a clean abstraction and a faster path to logging something, take the faster path.
Copy the first domain to build the second; let abstractions emerge on the third.
