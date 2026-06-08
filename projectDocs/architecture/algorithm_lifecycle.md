--- 
canon: CANONICAL STATUS 👑 - 2026-05-16
---

# Algorithm Lifecycle

This document traces the path an algorithm takes from initial definition to pixels on screen.

## 1. Define in the Schema

The schema is the source of truth. Any new node types must be defined in `src/schema/schema/schema.json` before they are implemented. If new value types are needed (e.g. a new shape that flows between nodes), they are defined in `value-kinds.schema.json` first.

`schema.json` uses `additionalProperties: false` throughout — unknown keys are a hard error at load time.

## 2. Implement the Nodes

Each node type referenced in the schema needs a runtime implementation in the relevant layer directory:

- `src/nodes/compute/` — pure mathematical transforms
- `src/nodes/control/` — UI controls (sliders, colour pickers)
- `src/nodes/render/` — canvas drawing nodes

Implementations are registered in each layer's registry, which is what the compiler and evaluator look up at runtime.

### Enum types require a selector control node

Every new enum value type (e.g. `normaliseModeEnumValue`) needs a corresponding **dropdown selector control node** so users can set it from the UI. The `/define-node` skill adds both the enum value type and the control node's schema entry, but the runtime implementation of that control node is a separate task — it must be planned as a `/control-node` task in the feature plan.

**When planning a feature that introduces a new enum:** add a `control-node` task for the selector after the `define-node` task and before `algorithm`. The implementation task reads the define-node handoff to get the enum values and wraps `DropdownControl` with them hardcoded.

## 3. Write the Algorithm

An algorithm is a TypeScript file in `src/algorithms/`. It is a plain data structure of type `GeoArtGraph` — three sections of nodes (`control`, `compute`, `render`) connected via inline `ref` params.

TypeScript gives immediate type safety on the structure (correct param shapes, valid node types) but does not verify things like whether a referenced port actually exists on the source node — that is the compiler's job.

## 4. Schema Validation

Before a graph is loaded it is validated against `schema.json` using AJV (`src/schema/validateGeoArtGraph.ts`). This catches structural problems: wrong param shapes, unrecognised node types, missing required fields. It cannot catch graph topology errors (those are for the compiler).

## 5. Compilation

`compile()` in `src/graphEngine/compiler/` takes the validated `GeoArtGraph` and produces a `CompiledGraph`. This is where topology is verified:

- **Circular references** — detected and rejected
- **Port existence** — every `ref` must point to a node and port name that actually exists
- **Port type compatibility** — ref source and destination value types must match
- **Layer direction** — refs must flow Control → Compute → Render, never backwards

The output is a `CompiledGraph`:

```ts
type CompiledGraph = {
  sortedNodes: string[];        // node IDs in topological order
  nodes: Map<string, CompiledNode>;
  edges: Edge[];                // resolved from inline param refs
  states: Map<string, NodeState>;
};
```

The topological sort happens once here. The hot per-frame path is just a flat loop over `sortedNodes`.

## 6. Register the Algorithm

Add the algorithm to the `GRAPHS` array in `src/algorithms/index.ts`:

```ts
{ id: 'myAlgorithm', name: 'My Algorithm', graph: myAlgorithmGraph }
```

This is what the UI reads to populate the algorithm selector.

## 7. The Graph Engine

`createGraphEngine(orbitCtx, trailCtx, canvasSize)` creates a `GraphEngine` instance, receiving the two `CanvasRenderingContext2D` contexts it will pass to render nodes. (`orbitCtx` is the live layer; `trailCtx` is the paint layer.) Its interface:

```ts
type GraphEngine = {
  load: (graph: GeoArtGraph) => GraphLoadPayload;
  setSpeed: (value: number) => void;
  tick: () => void;
};
```

**`load(graph)`** compiles the graph, resets tick state, clears both canvases, and returns a `GraphLoadPayload`:

```ts
type GraphLoadPayload = {
  renderControlNodes: () => React.ReactNode;
};
```

`renderControlNodes` gives the UI the React elements for the algorithm's control nodes — sliders, pickers, etc.

**`tick()`** is called by the application's `requestAnimationFrame` loop. Each tick: clears the live canvas, builds an `EvalContext` with the current tick count and canvas references, and runs `evaluatorTick()` over the compiled graph in topological order. Render nodes fire according to their own `intervalTicks` schedule, not every frame.

**Control mutation** — when a user moves a slider, the UI calls back into the engine which directly updates the compiled node's `params` map and marks that node dirty, causing re-evaluation on the next tick.

## Summary

```
schema.json          ← define node & value types
      ↓
node implementations ← src/nodes/[compute|control|render]/
      ↓
algorithm file       ← src/algorithms/myAlgorithm.ts  (TypeScript type safety)
      ↓
validateGeoArtGraph  ← schema validation (AJV)
      ↓
compile()            ← topology checks, edge resolution, topological sort
      ↓
GRAPHS registry      ← src/algorithms/index.ts
      ↓
GraphEngine.load()   ← returns control nodes for the UI
      ↓
GraphEngine.tick()   ← called each requestAnimationFrame, draws to canvas
```
