# Feature briefs touching src/server should state the Workers runtime constraint

The task prompt for `algorithm-render-endpoint` said "render the algorithm to image, see
existing behaviour for doing this" — pointing (reasonably) at the only existing
render-to-image code in the repo, which uses `@napi-rs/canvas` (a native N-API binary).
That approach cannot run inside a Cloudflare Worker at all (see
`project/feedback/algorithm-render-endpoint-napi-rs-canvas-workers-incompatible.md`), which
wasn't discoverable from reading the code — it only surfaced by actually running
`bun run build` and hitting a bundler error.

**Suggested prompt/brief addition**: any feature brief or task prompt that adds behaviour
to `src/server` (the Cloudflare Worker entry point) should explicitly state "this runs in
the `workerd` runtime — no native/N-API dependencies, no Node-only APIs without
`nodejs_compat`, WASM is fine." That would have let planning route straight to a
WASM-based approach instead of spending a build-and-fail cycle discovering the
constraint mid-implementation. Alternatively, a note in `src/server`'s own docs (there's
currently no `src/server/CLAUDE.md`) stating the same constraint would let any future
task self-serve this without it needing to be repeated in every brief.
