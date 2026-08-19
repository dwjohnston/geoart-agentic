# Cloudflare SSR shell — implementation notes

## Worker code needs its own tsconfig, isolated from DOM lib

`@cloudflare/workers-types` declares its own global `Request`/`Response`/`Fetcher`/etc.
ambient types. These conflict with the DOM lib's versions of the same globals if both
are in scope for the same TS project. `src/server/**` was excluded from
`tsconfig.app.json` (which includes `"DOM"` in `lib`) and given its own
`tsconfig.worker.json` (no DOM lib, `types: ["@cloudflare/workers-types"]`), referenced
from the root `tsconfig.json`. Any future worker/server-only code should live under
`src/server/` to stay covered by this config, not under a DOM-lib-included path.

## `run_worker_first` is required for assets + Worker routing

With a Cloudflare Workers `assets` binding, by default requests that match a static
asset (including `index.html` via SPA fallback) are served directly by the assets
layer and **never reach the Worker's `fetch` handler** — even though the Worker is
configured as `main`. To intercept `/` and `/index.html` for shell-decoration, the
`assets.run_worker_first` array had to explicitly list those paths. Confirmed by
curling the dev server before/after: without it, the raw `index.html` came back
unmodified (default `<title>app</title>`, no meta tags); with it, the Worker's
`renderShell` ran and injected the real title/OG tags.

## Vite plugin needs to be excluded from vitest runs

`@cloudflare/vite-plugin` sets up a workerd runtime environment in the Vite config.
Since `vite.config.ts` is shared with vitest (`defineConfig` from `vitest/config`),
the plugin is conditionally excluded via `process.env.VITEST` so test runs don't pay
for workerd setup they don't need.
