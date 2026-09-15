# Pi deploy

Run Orbit on the Pi: API and PWA behind Caddy at `*.kylebetts.net`, reachable
over Tailscale, with migrations applied on deploy and a nightly `pg_dump`
offsite. After this, shipping a feature is a push, not a procedure.

## Notes for the spec

- Pi compose is separate from the local one — real secrets, Caddy, no exposed
  Postgres port.
- Decide how a deploy happens: SSH + `compose pull`, a GitHub Action over
  Tailscale, or a watcher on the Pi.
- Decide how migrations run — a one-shot container before the API starts, or a
  step in the deploy script. Never on app boot.
- Backups are mandatory per `decisions.md`; pick the object store.
- The Pi runs on a UPS. NUT monitors it and shuts the Pi down cleanly when the
  battery is nearly drained, so Postgres never dies mid-write. The router is on
  the same UPS.
