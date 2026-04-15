# Earth-Venus Algorithm — Implementation Plan

Minimal, interactive Earth-Venus algorithm built on the Geometric Art Engine.
Two orbiting bodies (Earth and Venus) connected by a line each tick, producing a spirograph-like pattern.
A slider controls each body's orbital speed.

---

## Phases

### Phase 1 — Compute nodes
**Status:** Complete `325d61b`
**Duration:** ~2 min 10 sec

Implement `time` and `orbit` pure math nodes and the compute registry.

Files:
- `src/compute/types.ts`
- `src/compute/nodes/time.ts` + `time.node.ts` + `time.test.ts`
- `src/compute/nodes/orbit.ts` + `orbit.node.ts` + `orbit.test.ts`
- `src/compute/registry.ts`

---

### Phase 2 — Render node
**Status:** Complete `9f1720c`
**Duration:** ~46 sec

Implement the `timedLine` render node and the render registry.

Files:
- `src/render/types.ts`
- `src/render/nodes/timedLine.node.ts`
- `src/render/registry.ts`

---

### Phase 3 — Graph compiler + evaluator
**Status:** Complete `7257dff`
**Duration:** ~3 min 15 sec

Build the compile step (parse JSON → `CompiledGraph`, topo-sort) and the tick loop (per-frame evaluation).

Files:
- `src/graph/EvalContext.ts`
- `src/graph/compiler.ts`
- `src/graph/evaluator.ts`
- `src/graph/evaluator.test.ts`

---

### Phase 4 — Earth-Venus graph descriptor
**Status:** Complete `857d3cd`
**Duration:** ~1 min (written directly, no subagent)

Typed `GeoArtGraph` constant importable by the app shell.

Files:
- `src/graphs/earthVenus.ts`

---

### Phase 5 — App shell
**Status:** Complete `dea016b`
**Duration:** ~4 min

| Activity | Time |
|---|---|
| Reading 11 source files | ~1.5 min |
| Writing `App.tsx` | ~1.5 min |
| Typecheck + tests | ~1 min |

Files read by agent: `App.tsx`, `EvalContext.ts`, `compiler.ts`, `evaluator.ts`, `earthVenus.ts`, `SliderControl.tsx`, `SliderControl.test.tsx`, `validateGeoArtGraph.ts`, `render/CLAUDE.md`, `App.css`, `schema-types.d.ts`

Commands run: `bun tsc --noEmit`, `bun run test:headless --run`

Files modified:
- `src/App.tsx` — two stacked canvases, RAF loop, slider panel

Result: 25 tests passing, typecheck clean.
