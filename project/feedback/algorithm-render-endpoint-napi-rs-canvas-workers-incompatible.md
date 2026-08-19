# @napi-rs/canvas cannot run in a Cloudflare Worker

While building the `/render/<base64>` endpoint (task: algorithm-render-endpoint), the
obvious approach — reuse `@napi-rs/canvas` (already a devDependency, used by
`src/common-tooling/test-tooling/replayContext.ts` for test snapshots) inside
`src/server/renderAlgorithmImage.ts` to rasterise the graph server-side — does not work.

Confirmed empirically, not just in theory: `bun run build` fails at the `vite build`
step with `[UNLOADABLE_DEPENDENCY] ... stream did not contain valid UTF-8` when it tries
to inline the native `.node` binary into the worker bundle. `workerd` (the Cloudflare
Workers runtime) cannot execute native/N-API binaries at all — dev or prod, no config
flag fixes it.

**What worked instead**: a hand-written `CanvasRenderingContext2D`-shaped shim
(`src/server/headlessSvgCanvas.ts`) implementing only the small subset of the API render
nodes actually call, emitting SVG elements instead of touching pixels, then
`@resvg/resvg-wasm` (a WASM SVG-to-PNG rasterizer) to produce the final PNG. WASM bundles
and runs fine in `workerd`. Verified via a full `bun run build` (worker bundle includes
the `.wasm` asset cleanly) and a real `wrangler dev` request returning `200 image/png`
with pixels cross-checked against the real `createGraphEngine` + `fakeContext` pipeline.

**For anyone doing more server-side/Worker rendering work on this codebase**: any native
(N-API) dependency is a non-starter for `src/server`. WASM-based alternatives are the
pattern to reach for. This also required adding DOM/DOM.Iterable lib + jsx +
bun/vite-client types to `tsconfig.worker.json` (same fix as `tsconfig.node.json` already
has, same reason: `createGraphEngine` transitively touches DOM-typed code, and this
repo's tsconfig setup type-checks imported files under the *importing* project's
options, not the defining file's).
