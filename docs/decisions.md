# Decisions

What was chosen, what was rejected, why. Append; don't rewrite history.
All entries 2026-09-09 unless noted.

## API framework — Hono

**Rejected:** Fastify · tRPC · Express

One Zod schema per domain serves HTTP validation, inferred client types, and AI
tool schemas. Across seven domains that compounds — the schema the AI reasons
about and the schema the API enforces are the same object.

Being tailnet-only cancels most of Fastify's plugin advantage; auth, rate
limiting, and CORS aren't needed. Fastify is the safer pick on maturity and this
was genuinely close.

tRPC rejected specifically: RPC-only makes plain REST awkward, and iOS Shortcuts
posting to the API is the highest-value capture mechanism available.

**Revisit if:** heavy multipart handling or observability tooling becomes a
bottleneck.

## Hosting — Raspberry Pi over VPS

**Rejected:** Hetzner/other VPS · Vercel, Railway, Fly

Pi 5, 8 GB, 256 GB NVMe is far more than this workload needs, and NVMe avoids the
SD-card failure mode that ends most Pi hosting stories. Tailscale removes what
normally makes home hosting painful — no port forwarding, no dynamic DNS, no
exposed services.

A VPS was the earlier recommendation, made assuming hardware had to be bought. It
didn't.

PaaS rejected on portability: serverless functions, edge runtimes, and
platform-specific data services are shapes that can't move to the Pi later.

**Accepted cost:** the app is down when home power or internet is. Nightly
`pg_dump` to offsite object storage is mandatory, not optional.

**Open — UPS + NUT:** graceful shutdown on power loss would remove the
unclean-shutdown corruption risk, which is the main hazard backups don't prevent.
Power the router from the same UPS, or the Pi staying up buys nothing. Not yet
purchased.

**Revisit if:** uptime becomes annoying. Migration is `compose up` plus a
`pg_dump` restore.

## Client — PWA over native

**Rejected:** React Native / Expo · native Swift

One codebase covers iPhone, iPad, and desktop. Native's advantages — widgets,
background sync, HealthKit — aren't needed for the first domains.

Two iOS constraints to design around: Web Push requires the PWA be installed to
the home screen, not opened in a tab; and iOS may evict PWA storage after ~7 days
of disuse, so the client is a cache and never the source of truth.

**Revisit if:** Fitness logging or Wardrobe capture needs native camera, widgets,
or HealthKit.

## Domain — custom domain over `*.ts.net`

**Chosen:** `*.kylebetts.net`, Cloudflare DNS, wildcard cert via DNS-01, Caddy.

Infrastructure sits in its own Cloudflare zone, separate from `kylebetts.com`
(personal site) and `kylebetts.dev`. The Caddy API token on the Pi is scoped to
that one zone and can't touch anything public-facing.

URLs stay stable independent of Tailscale, and a wildcard record plus wildcard
cert means future services — Vaultwarden first — need only a Caddyfile entry.

**Accepted cost:** Tailscale can only issue certs for `*.ts.net`, so this gives up
the no-reverse-proxy simplicity of `tailscale serve`. Caddy with a DNS-01
challenge is the price.

**Gotcha:** the DNS record must be DNS-only (grey cloud). Cloudflare's proxy
can't route to a `100.x` tailnet address.

## Tasks — one domain for tasks, habits, and the highlight

_2026-09-13_

**Rejected:** separate Habits domain · separate Highlight domain

Habits and recurring tasks run on the same recurrence logic; a habit is a
schedule-anchored recurrence with streaks switched on. Today is one screen showing
tasks, habits, and the highlight together — split domains would make it a
cross-domain join on day one, the abstraction this project defers to the third
domain.

Quota habits ("gym 4× a week, any days") were rejected: with no dated task to
complete, they strain the recurrence model for one case.

**Revisit if:** highlights start pointing at other domains' rows — promote the
highlight to its own domain behind `shared/links`.

## Tasks — task plus optional recurrence

_2026-09-13_

**Rejected:** series/occurrence · dates and resolution in a 1:1 side table ·
tracked sub-steps

One-off tasks are the common case. Series/occurrence made every one-off two rows
and split a task's title from its dates. A recurrence now holds only the rule, and
each issued task copies its predecessor — one place to edit, and resolved tasks
keep the names they had.

A 1:1 side table for dates and resolution was rejected as a misapplication of
single responsibility: the columns depend one-to-one on the task. Separation
belongs in the service layer — pure scheduling functions apart from CRUD.

Sub-steps with per-step completion were modelled, then cut: they wouldn't be
ticked in practice. Notes hold routine steps as untracked text.

**Accepted cost:** a one-off edit to a recurring task carries forward.

## Tasks — Today without a planning ritual

_2026-09-13_

**Rejected:** morning ritual writing a day plan · objectives vs scratchpad
(routed by capture origin, then effort, then a flag) · auto-rolling unfinished
tasks with a roll count

Every version of the plan added triage work before anything got done, and capture
friction is what kills this project. Today is now every open task with
`planned_for` on or before today, split by a single `chore` flag. Unfinished tasks
are never rewritten; "carried over" is derived from the date.

Capture origin was rejected outright: a field whose meaning depends on the
interface that created the row breaks the moment an AI tool or Shortcut creates a
task.

**Lost:** plan-adherence metrics — planned vs added, interrupts, displacement. The
highlight table, where a missing row means none was chosen, is the remaining
"did I choose" signal.

**Revisit if:** the missing plan-vs-reality signal is actually missed.

## Tasks — stored resolution, derived open states

_2026-09-13_

**Rejected:** a status column · one timestamp per state · archive and hard delete

Open states (backlog, today, carried over) are date comparisons and would go stale
at the day boundary if stored. Outcomes can't be derived — missed, skipped, and
dropped share the same dates, and lateness depends on the rule as it was — so a
single `resolution` plus `resolved_at` records them once. Timestamp-per-state
permits impossible rows.

Resolutions are `done`, `late`, `missed`, `skipped`, `dropped`. `skipped` is the
deliberate pass on a scheduled task and bridges a streak; `dropped` means stop
tracking, and ending a recurrence is dropping its task. Nothing is hard-deleted;
typos accept being dropped rows.

## Tasks — 03:00 logical day

_2026-09-13_

**Rejected:** midnight · 02:00

Work finished after midnight belongs to the day that's ending. 03:00 also clears
the US DST transition at 02:00, which would otherwise land the boundary in a
skipped or doubled hour twice a year.

## Tasks — work tickets as links

_2026-09-13_

**Rejected:** Jira/Linear integration · status sync

A task may carry a ticket key and URL, nothing more. The ticket's state is a team
workflow; the task's state is personal intent — they legitimately differ, so
syncing solves nothing and adds a two-way merge. An integration would also put
work credentials on a personal host.

## AI proposals — outside domain tables

_2026-09-13_

**Rejected:** a draft or proposed flag on domain rows

A flag only covers creation, not a proposed drop or reschedule, and every query in
every domain would have to exclude it. Proposals live in `ai/` as a tool name and a
payload validated against the domain's Zod schema when the tool is called.
Approval runs the same `service.ts` function an HTTP request would, after
revalidating against current state.
