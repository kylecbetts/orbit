# Web scaffold

Stand up `web/` as the PWA shell every domain screen lives in: Vite, React,
TanStack Router and Query, Tailwind, shadcn/ui, `vite-plugin-pwa`, Playwright.
Done when one route renders the API's `/health` at phone, iPad and desktop
widths under a Playwright test in CI.

## Notes for the spec

- Decide how `web` reaches `api` — Vite proxy in dev, same origin behind Caddy in
  production. One origin keeps the service worker simple.
- Decide where code shared by API and client lives; `logicalDate()` is the first
  case. A third workspace package, or `web` importing from `api/src`.
- Install-to-home-screen and Web Push need HTTPS, which localhost from a phone
  can't give. Configure the manifest here; verify installability under
  `pi-deploy`.
- Pick the three Playwright device presets once. Every feature's tests reuse
  them.
- Write `docs/design.md` before the spec: palette, semantic mapping to shadcn
  tokens, dark-mode stance, fonts and whether they're self-hosted, density and
  touch rules. It's the brief for Claude Design and the input to the theme setup.
