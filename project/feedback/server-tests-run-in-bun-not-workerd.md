# Server tests run in Bun, production runs in workerd

Observed while adding the preview smoke test (2026-09-18), after #158 shipped a `Bun.escapeHTML` call that deployed "successfully" and 500'd on every request.

- `src/server/*.test.ts` run under `bun test`, so Bun globals exist in tests and are absent in the Worker.
- `tsconfig.worker.json` lists `"bun"` in `types`, so `Bun.*` typechecks in server code. Dropping it breaks the `bun:test` imports and the `node:fs` shim in `renderAlgorithmImage.ts`, so it is not a one-line fix.

The smoke test covers this end-to-end, but only after a Cloudflare deploy. A faster local guard would be either running the server tests under `@cloudflare/vitest-pool-workers`, or an ESLint `no-restricted-globals` rule for `Bun` scoped to `src/server/**` (excluding tests).
