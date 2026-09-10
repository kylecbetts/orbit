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
