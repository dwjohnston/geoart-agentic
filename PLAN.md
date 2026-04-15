# Earth-Venus Algorithm — Implementation Plan

Minimal, interactive Earth-Venus algorithm built on the Geometric Art Engine.
Two orbiting bodies (Earth and Venus) connected by a line each tick, producing a spirograph-like pattern.
A slider controls each body's orbital speed.

---

## Phases

### Phase 1 — Compute nodes
**Status:** Complete `325d61b`

Implement `time` and `orbit` pure math nodes and the compute registry.

Files:
- `src/compute/types.ts`
- `src/compute/nodes/time.ts` + `time.node.ts` + `time.test.ts`
- `src/compute/nodes/orbit.ts` + `orbit.node.ts` + `orbit.test.ts`
- `src/compute/registry.ts`

---

### Phase 2 — Render node
**Status:** Not started

Implement the `timedLine` render node and the render registry.

Files to create:
- `src/render/nodes/timedLine.ts` + `timedLine.node.ts`
- `src/render/registry.ts`

---

### Phase 3 — Graph compiler + evaluator
**Status:** Not started

Build the compile step (parse JSON → `CompiledGraph`, topo-sort) and the tick loop (per-frame evaluation).

Files to create:
- `src/graph/EvalContext.ts`
- `src/graph/compiler.ts`
- `src/graph/evaluator.ts`

Verified by an integration test that loads the Earth-Venus graph and runs a few ticks.

---

### Phase 4 — Earth-Venus graph descriptor
**Status:** Not started

A typed `GeoArtGraph` constant in a `.ts` file, importable by the app shell.

File to create:
- `src/graphs/earthVenus.ts`

Verified by `validateGeoArtGraph(earthVenus)` returning true.

---

### Phase 5 — App shell
**Status:** Not started

Replace the Vite placeholder in `src/App.tsx` with:
- Two `<canvas>` elements (orbit + trail)
- A `useEffect` RAF loop wired to the evaluator tick
- `SliderControl` components for the two speed sliders

Verified by running the dev server and visually confirming lines accumulate on screen.
