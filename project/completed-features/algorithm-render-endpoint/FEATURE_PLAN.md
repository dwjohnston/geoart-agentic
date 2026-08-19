# Feature Plan: Algorithm Render Endpoint

## Skill coverage

None of the node-development skills apply — this is server/schema infrastructure work
(`?a=` query handling, a new Worker route, a top-level schema property), not a new node
type. Same situation as `cloudflare-ssr-shell` (see its FEATURE_PLAN.md). Implemented
directly, outside the task-file/skill framework. No `task_xx_*.md` files.

## Existing behaviour being reused

- `tryCompileGraph` (`src/graphEngine/exports/index.ts`) — schema validation
  (`validateGeoArtGraph`) + `compile()`, catching compile-time errors. Will add a sibling
  export that also returns the `CompiledGraph` (needed to actually run it), not just a
  success/failure boolean.
- `createGraphEngine` (`src/graphEngine/graphEngine/graphEngine.ts`) — the real tick loop
  used by `App.tsx`. It takes two `CanvasRenderingContext2D`-shaped contexts (live/paint)
  and a canvas size. `App.tsx` uses `CANVAS_SIZE = 800`.
- `@napi-rs/canvas` (already a dependency, used in `replayContext.ts` test tooling) —
  provides a `createCanvas(w, h).getContext('2d')` that is structurally compatible with
  `CanvasRenderingContext2D` for the calls the engine makes, and `canvas.toBuffer('image/png')`
  for rasterization. Using it directly with `createGraphEngine` (rather than the
  record/replay path in `replayContext.ts`, which is test-only tooling for snapshot
  comparisons) lets us run the *actual* production tick loop headlessly.
- The app renders two stacked `<canvas>` elements (`live`, `paint`) composited visually by
  CSS in the browser — there is no single flattened image today. The render endpoint must
  composite paint-then-live into one output canvas itself before encoding to PNG.

## Resolved risk: @napi-rs/canvas is not Workers-compatible

`@napi-rs/canvas` is a native (N-API) module. Confirmed empirically (not just in theory):
`vite build` fails trying to inline the `.node` binary into the worker bundle
("[UNLOADABLE_DEPENDENCY] ... stream did not contain valid UTF-8") — Cloudflare Workers'
`workerd` runtime cannot execute native binaries at all, dev or prod. Raised to the user
mid-implementation; decision was to research and build a Workers-compatible rasterizer
rather than ship a route that can't deploy.

Replaced with: a hand-written `CanvasRenderingContext2D`-shaped shim
(`src/server/headlessSvgCanvas.ts`) that records the same handful of draw calls render
nodes actually make (beginPath/moveTo/lineTo/closePath/ellipse/stroke/fill/
createLinearGradient/clearRect) as SVG elements instead of pixels, then
`@resvg/resvg-wasm` (a WASM SVG rasterizer) turns the accumulated SVG into a PNG. WASM
bundles and runs inside `workerd`, unlike native addons — confirmed via a full `bun run
build` (worker bundle now includes the `.wasm` asset, no native-binary error) and a real
`wrangler dev` request to `/render/<b64>` returning `200 image/png`. Cross-checked the SVG
output against the real `createGraphEngine` + `fakeContext` pipeline (existing test
tooling) for the same graph — identical draw-call values, confirming the shim doesn't
change rendering semantics, only the sink.

This did require adding DOM/DOM.Iterable lib + jsx + bun/vite-client types to
`tsconfig.worker.json`, since `createGraphEngine` transitively references DOM-typed code
and this repo's tsconfig setup type-checks imported files under the *importing* project's
compiler options (not the defining file's) — `tsconfig.node.json` already carries an
identical, identically-reasoned workaround for the same underlying cause.

## Tasks

1. **Schema**: add a top-level `previewSettings` object to
   `src/schema/schema/schema.json`: `{ staticImageNumTicks: number }`, optional,
   `additionalProperties: false`. Run `bun generate` to regenerate
   `schema-types.d.ts` and derived files.
2. **Compile export**: add `compileValidatedGraph(graph: unknown): CompiledGraph | null`
   to `src/graphEngine/exports/index.ts`, alongside the existing `tryCompileGraph` —
   validates against schema, compiles, returns `null` on any failure (never throws).
3. **Render module**: new `src/server/renderAlgorithmImage.ts`:
   - `decodeAlgorithmBase64(raw: string): unknown | null` — base64 decode (defensive
     against `+` having been turned into a space by query-string parsing) + `JSON.parse`,
     `null` on any failure.
   - `getStaticImageNumTicks(graph): number` — `graph.previewSettings?.staticImageNumTicks
     ?? 10`.
   - `renderGraphToPng(graph: GeoArtGraph, numTicks: number): Buffer` — two
     `@napi-rs/canvas` canvases (live/paint, 800×800), `createGraphEngine`, `load()`,
     tick `numTicks` times, composite paint-then-live onto one output canvas,
     `toBuffer('image/png')`.
   - `renderAlgorithmResponse(request, env): Promise<Response>` — pulls the base64 segment
     off the end of the pathname (`/render/<value>`), decodes, `compileValidatedGraph`;
     404 on any failure at any stage; otherwise 200 with `content-type: image/png`.
4. **Shell**: update `src/server/renderShell.ts` to read `?a=` off the request URL and,
   when present, add `<meta property="og:image" content="render/<raw value>" />` to the
   decorated head — the raw query value is passed straight through, undecoded, into the
   path (decoding/validation happens only at the `/render/` route in step 3).
5. **Routing**: update `src/server/entry.ts` to route `pathname.startsWith('/render/')`
   to `renderAlgorithmResponse`.
6. **Tests**: `renderAlgorithmImage.test.ts` (decode success/failure, missing
   `previewSettings` defaults to 10, invalid graph → null/404, valid graph → PNG buffer
   with PNG magic bytes) and a `renderShell.test.ts` covering the `?a=` → og:image
   behaviour (present vs. absent).
7. **Verify**: `bun validate` (tests, typecheck, schema validation), then `wrangler dev`
   locally and fetch a `?a=`-carrying `/` request and a `/render/<b64>` request by hand to
   confirm the PNG comes back.

## Dependency graph

Sequential: schema → compile export → render module → shell → routing → tests → verify.
Steps 4 (shell) and 2–3 (compile export/render module) are independent of each other and
could be parallelised in a HITL session; done sequentially here.
