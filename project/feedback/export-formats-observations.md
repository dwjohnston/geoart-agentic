# Export formats (#134) — observations

- **Draw calls, not nodes, drive render cost.** Every bundled graph compiles to < 100
  nodes, but `david-rotate2` emits ~63k SVG elements per frame (1.3s per resvg
  rasterisation). A node cap alone would not have bounded anything; the element cap
  in `headlessSvgCanvas` is the guardrail that matters.
- **Workers freeze the clock during CPU work.** `Date.now()` does not advance while a
  request is doing synchronous work, so a wall-clock render budget cannot be enforced
  from inside the request. `renderBudget.ts` is structural for that reason.
- **The original `/render/` PNG only rasterised the paint layer** — 40 of 60 bundled
  graphs draw only on `live`, so their og:image was a black square. Both routes now
  composite paint + live.
- **GIF quantisation was the dominant per-frame cost** (80ms of ~130ms per 400px frame
  with gifenc's default `rgb565`). `rgb444` brings it to ~3ms; server uses that, client
  keeps `rgb565`.
- **gifenc ships no types.** Ambient declaration lives in `src/common-tooling/gifenc.d.ts`
  and had to be added to `tsconfig.worker.json`'s `include` — that project only includes
  `src/server`, so it would otherwise not see the declaration even though it type-checks
  the importing file.
- **Commit signing was unavailable** (1Password SSH agent: "failed to fill whole buffer")
  in this agent session. All commits on the branch are unsigned
  (`-c commit.gpgsign=false`).
- `ExportJsonModal.browser.test.tsx` failed once when run alongside the new
  `ExportMediaModal` tests (clipboard button click timed out) and passed on re-run and
  in the full suite — looks timing-related, not caused by this change.
