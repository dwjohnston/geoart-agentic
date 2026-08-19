# Feature Plan: Cloudflare SSR Shell

## Skill coverage

None of the skills in the project skills index apply to this feature — it is infrastructure/deployment tooling, not a schema/node/algorithm change. `node-ideate`, `define-node`, `compute-node`, `render-node`, `control-node`, `module-node`, and `algorithm` are all specific to the graph-engine node system.

Per user decision (2026-08-19): implemented directly, outside the task-file/skill framework. No `task_xx_*.md` files were created for this feature.

## Tasks (informational, executed directly)

1. Add `@cloudflare/vite-plugin` + `wrangler` as dev dependencies.
2. Add `wrangler.jsonc` configured for Cloudflare Workers, pointing at the Vite build output.
3. Add a server entry point that renders the static HTML shell (title/meta/OG tags) and delegates the rest of the document to the existing client bundle. Canvas rendering stays fully client-side.
4. Update `vite.config.ts` to wire in the Cloudflare plugin.
5. Add/update `package.json` scripts for local dev (`wrangler dev`-backed) and deploy.
6. Verify: `bun run build` succeeds, local dev serves the SSR shell, deploy dry-run (`wrangler deploy --dry-run`) succeeds.

## Dependency graph

Sequential — each step builds on the prior one (deps → config → entry point → vite wiring → scripts → verify).
