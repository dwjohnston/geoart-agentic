# Feature Brief: Cloudflare SSR Shell

## Summary

Add `wrangler.jsonc` and SSR tooling so the app can be deployed to and served from a Cloudflare Worker, with a server-rendered initial HTML shell.

## Context

The app is currently a pure client-side SPA (Vite + `index.html` + client bundle), hosted on Cloudflare. There is no existing server/worker entry point.

## Scope

- Add `wrangler.jsonc` configured for **Cloudflare Workers** using Vite SSR (`@cloudflare/vite-plugin`), so `wrangler dev` / `wrangler deploy` work directly off the Vite build.
- Add a server entry point that renders the **HTML shell only**: static page chrome, `<title>`, meta tags (including OG tags / description) for crawlers and link previews.
- The canvas/graph rendering itself is **not** server-rendered — it continues to hydrate and animate entirely client-side after the shell loads.
- Wire up local dev (`wrangler dev` or equivalent) and a build/deploy script.

## Explicitly out of scope

- Server-side fetching or inlining of saved graph/artwork data. A future feature will add an "image path" that is SSR'd (fetching saved artwork data server-side, e.g. from KV/D1/R2, and inlining it into the response) — this brief does not implement that, but the server entry point should be structured so that work can be added later without a rewrite.
- Any change to canvas rendering, node evaluation, or animation logic.
- SEO content beyond basic static meta tags (no per-artwork dynamic meta tags yet — that depends on the future image path).

## Open questions for planning phase

- Exact meta tag content (title/description defaults) — can use placeholders, confirm with user during execution if needed.
- Whether `bun run build` / `bun validate` need updated scripts to include the worker build target.
