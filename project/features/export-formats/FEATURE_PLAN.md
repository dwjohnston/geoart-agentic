# Feature Plan: Export formats (image, video, GIF + SSR)

## Skill coverage

None of the node-development skills apply — this is client export UI, a Worker route, a
shared encoder, and schema settings, not a node type. Same situation as
`cloudflare-ssr-shell` and `algorithm-render-endpoint`: implemented directly, outside the
task-file/skill framework. No `task_xx_*.md` files.

## Findings that shape the design

Measured against the bundled reference graphs (headless engine, 10 ticks):

- Node counts are small (max 83) — node count is *not* where the cost is. Cost is in
  draw calls per tick: `david-rotate2` emits ~63k SVG elements per frame and takes ~1.3s
  for resvg to rasterise one frame. Guardrails therefore need a **draw-call budget**, not
  just a node cap.
- 40 of 60 bundled graphs draw only on the `live` layer. The existing `/render/` PNG
  rasterises only the `paint` layer, so their preview image is a black square. Both the
  static image and the animated formats composite paint-then-live (what the user sees).
- Cloudflare Workers freeze `Date.now()`/`performance.now()` during synchronous CPU work
  (timing side-channel mitigation), so a wall-clock time budget cannot be enforced from
  inside the request. Bounding happens structurally: node cap, tick cap, frame cap,
  per-frame and total draw-call caps, and a smaller raster size for animations.
- `@resvg/resvg-wasm` exposes `RenderedImage.pixels` (RGBA) so frames can go straight to
  a GIF encoder without a PNG round-trip. `gifenc` (pure JS, no deps) runs in both the
  browser and workerd.

## Tasks

1. **Schema** — extend `previewSettings` with `animationNumFrames`, `animationTicksPerFrame`,
   `animationFrameDelayMs`. Add `src/schema/previewSettings.ts` resolving defaults
   (10 ticks / 40 frames / 1 tick per frame / 40ms) so client and server agree.
2. **Shared GIF encoding** — `src/common-tooling/gifEncoding.ts` wrapping `gifenc`
   (RGBA frames → GIF bytes) with an ambient type declaration; unit tests check the GIF
   header, frame count and loop extension.
3. **Server render budget** — `src/server/renderBudget.ts`: limits + `RenderBudgetExceededError`.
   `headlessSvgCanvas` gains an optional element cap. `renderAlgorithmImage.ts` gains a
   shared frame runner, composites both layers, adds `renderGraphToGif`, and routes
   `/render/<enc>`, `/render/<enc>.png` → PNG and `/render/<enc>.gif` → GIF (400px).
   Over-budget → 413; invalid → 404 (unchanged).
4. **Client export** — `src/application/export/`: offscreen renderer (fresh engine from the
   snapshot graph, composited canvas), PNG via `toBlob`, GIF via the shared encoder, video
   via `MediaRecorder` on `captureStream()`. `ExportMediaModal` with the three buttons and
   progress; wired into `App.tsx` next to Share / Export JSON.
5. **Verify** — `bun validate`, `bun run build` (worker bundle includes gifenc), browser
   tests for the modal.

## Dependency graph

1 → 3, 1 → 4, 2 → 3, 2 → 4, (3, 4) → 5. Tasks 3 and 4 are independent of each other.
