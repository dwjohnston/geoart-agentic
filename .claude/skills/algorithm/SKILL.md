---
name: algorithm
description: Declare a new algorithm. Use when asked to create an algorithm, including reference algorithms for a newly implemented node.
---

You are declaring a new algorithm.

## File Scope

- Read from `src/schema` only
- Write only to `src/algorithms`

## Responsibilities

- Declare new algorithms that are compliant with the schema
- Create reference algorithms that demonstrate a node's capabilities

## Feature name

Determine the feature name from your task context:
- If invoked via the workflow, read it from the task file path (`project/features/[featureName]/task_...md`)
- If invoked directly, ask the user


## Input handoff

Before writing the algorithm, check for handoff files at `project/features/[featureName]/handoffs/`. Read whichever of these exist:

- `compute-node.md` — use the algorithm skeleton and test values as the basis for your node declarations
- `render-node.md` — use the algorithm skeleton for render node declarations
- `control-node.md` — use the algorithm skeleton for control node declarations
- `module-node.md` — use the algorithm skeleton to declare the module node

If none exist, proceed without a handoff.

--- 
canon: CANONICAL STATUS 👑 - 2026-06-05
---

# Declaring an Algorithm

An algorithm is a TypeScript file in `src/algorithms/` that produces a plain `GeoArtGraph` data structure. It has no logic of its own — it is purely declarative wiring.

**Prefer the `AlgorithmBuilder`.** It produces the same `GeoArtGraph` but adds two compile-time guarantees a hand-written object cannot:

- **Enforced layer order** — nodes must be added control → compute → render. Calling an out-of-order method (e.g. `addControlNode` after `addComputeNode`) is a type error on the call itself.
- **Typed ref validation** — a `ref` string is constrained to ports that actually exist on a node declared earlier, and whose output type matches the input port. Misspelled node IDs, unknown ports, and type-mismatched refs are caught by the compiler.

The hand-written object form still works and is what the builder ultimately constructs — see [The underlying shape](#the-underlying-shape) below — but reach for the builder by default.

---

## Using the builder

```ts
import { AlgorithmBuilder } from '../schema/builder';

const graph = new AlgorithmBuilder({
  title: 'Earth & Venus',
  author: 'David Johnston',
  description: 'Two orbits linked by a painted line',
})
  .addControlNode({
    id: 'radius',
    type: 'slider',
    params: {
      label: { v: 'Radius' },
      min: { v: 0 },
      max: { v: 0.5 },
      step: { v: 0.01 },
      value: { v: 0.1 },
    },
  })
  .addComputeNode({ id: 'time', type: 'time', params: {} })
  .addComputeNode({
    id: 'earthOrbit',
    type: 'orbit',
    params: {
      time:   { ref: 'time.time' },     // ref is checked: time.time exists and is a numberValue
      radius: { ref: 'radius.value' },
      speed:  { v: 1 },
    },
  })
  .addRenderNode({
    id: 'earthDot',
    type: 'circle',
    renderConfig: { layer: 'live' },
    params: {
      radius:       { ref: 'radius.value' },
      centerPoints: { ref: 'earthOrbit.points' },
    },
  })
  .construct();

export default graph;
```

Call `.construct()` last — it returns the finished `GeoArtGraph`. Export it as the **default export** (registration depends on this — see [Registering](#registering-the-algorithm)).

---

## The node kinds

There are **four kinds of node**. Three of them are the layers of the data-flow pipeline, declared in order:

```
Control → Compute → Render
```

The fourth — the **module node** — is orthogonal to that flow: it is a single node that expands into a bundle of control/compute/render nodes during compilation (see [Module nodes](#module-nodes)).

### `control`

User-facing inputs. Their params are **static values only** — control nodes sit at the top of the data flow and nothing can ref into them.

```ts
.addControlNode({
  id: 'speedSlider',
  type: 'slider',
  params: {
    label: { v: 'Speed' },
    min:   { v: -5 },
    max:   { v: 5 },
    step:  { v: 0.01 },
    value: { v: 0.15 },
  },
})
```

Always allow negative `value` on speed sliders — negative runs the animation in reverse.

### `compute`

Pure mathematical transforms. Params can be static values or refs to other nodes' output ports.

```ts
.addComputeNode({ id: 'time', type: 'time', params: {} })
.addComputeNode({
  id: 'earthOrbit',
  type: 'orbit',
  params: {
    time:   { ref: 'time.time' },
    radius: { ref: 'distanceSlider.value' },
    speed:  { ref: 'speedSlider.value' },
  },
})
```

`time` is an explicit node — there is no implicit clock. Always add a `time` node and wire it to anything that changes over time.

A ref has the form `{ ref: "nodeId.portName" }` where `portName` is the **output** port name declared in the source node's `x-outputs`.

### `render`

Drawing nodes. They consume compute outputs and write to canvas. Every render node carries a `renderConfig` that selects which canvas layer it draws to:

| `layer`   | Behaviour |
|-----------|-----------|
| `'paint'` | Persists across frames — accumulates over time. Cleared only when a control changes. |
| `'live'`  | Cleared every frame — shows the current position only. |

```ts
// Accumulating spirograph lines — paint layer
.addRenderNode({
  id: 'line',
  type: 'timedLine',
  renderConfig: { layer: 'paint' },
  params: {
    colorPointA: { ref: 'earthColorPoint.colorPoint' },
    colorPointB: { ref: 'venusColorPoint.colorPoint' },
  },
})
// Current-position dot — live layer, redrawn each frame
.addRenderNode({
  id: 'earthDot',
  type: 'circle',
  renderConfig: { layer: 'live' },
  params: {
    centerPoints: { ref: 'earthOrbit.points' },
    radius:       { v: 0.02 },
    color:        { v: { r: 0.3, g: 0.7, b: 1, a: 1 } },
  },
})
```

---

## Module nodes

A **module node** is a special node that is essentially a reusable bundle of control, compute, and render nodes — packaged so you can declare the whole cluster as one node. For example an `orbit-module` provides the orbit calculation, its knobs, and the render nodes that draw the path and the moving point, all from a single declaration.

**Prefer modules when a cluster of nodes recurs.** Declaring `orbit-module` once is far less error-prone than hand-wiring a `time` → `orbit` → `circle` chain every time.

Declare a module with `addModuleNode`. It can be added at any point before the render stage (it does not occupy a single layer), and its params are refable like a compute node's:

```ts
.addModuleNode({
  id: 'myOrbit',
  type: 'orbit-module',
  params: {
    time:   { ref: 'time.time' },
    radius: { ref: 'radius.value' },
    numPoints: { v: 8 },
    centerPoints: { v: [{ v: fColorPoint() }] },
  },
})
```

### Referencing a module's outputs

Other nodes ref a module's outputs using the **module's own id** as the node id — `{ ref: 'myOrbit.points' }`. A module declares its outputs via `x-outputs` just like any other node, and the builder validates these refs the same way.

Modules can feed each other and can feed (or be fed by) ordinary nodes:

```ts
.addModuleNode({ id: 'orbit1', type: 'orbit-module', params: { /* ... */ } })
.addModuleNode({
  id: 'orbit2',
  type: 'orbit-module',
  params: {
    centerPoints: { ref: 'orbit1.points' }, // one module's output feeds another
  },
})
```

### Marker nodes (what you don't write, but should know about)

You never declare them, but during compilation each module expands into its internal nodes plus two synthetic **marker nodes**:

- **Module input marker** — the single data source for the module's inputs. The module's internal nodes ref this marker, so whatever you passed into the module's params flows in through one place.
- **Module output marker** — the public face of the module. It carries the module's `x-outputs`, and it is what `{ ref: 'myOrbit.points' }` actually resolves to once expanded.

So when you ref `myOrbit.points`, you are really referencing the output marker that compilation produced for `myOrbit`. Internal nodes are namespaced `{moduleId}:{internalId}` and are hidden behind the module abstraction. See [terminology.md](../architecture/terminology.md) for the precise definitions and [node_anatomy.md](node_anatomy.md#modules) for how a module is implemented.

---

See [Sensible Defaults](sensible_defaults.md) for conventions on coordinates, colours, orbit display, paint intervals, and LFO ranges.

---

## The underlying shape

The builder constructs a plain `GeoArtGraph`. You can write one by hand when you need to (e.g. generating graphs programmatically), but you lose the layer-order and ref-validation guarantees:

```ts
import type { GeoArtGraph } from '../schema/_generated/schema-types';

const graph: GeoArtGraph = {
  version: '2.0',
  control: { nodes: [ /* ... */ ] },
  compute: { nodes: [ /* ... */ ] },
  module:  { nodes: [ /* ... */ ] }, // module declarations live here
  render:  { nodes: [ /* ... */ ] },
};

export default graph;
```

TypeScript still enforces the shape of each node and its params, but it cannot verify that a `ref` points to a port that exists — that is left to the compiler at runtime.

---

## Registering the algorithm

Registration is **automatic**. The algorithm index ([src/algorithms/index.generated.ts](../src/algorithms/index.generated.ts)) is generated from the files in `src/algorithms/` — do not edit it by hand. To register a new algorithm:

1. Drop the file in `src/algorithms/` with the graph as its **default export**.
2. Run `bun generate` (it runs `generate:algorithms-index`, and also runs automatically before tests via `pretest`).

The `id` is derived from the filename, so renaming the file changes the serialisation id — pick the name deliberately. Reference algorithms follow an extra naming convention — see [src/algorithms/reference/CLAUDE.md](../../src/algorithms/reference/CLAUDE.md).


# Sensible Defaults

## Canvas coordinates

The coordinate space spans `-1` to `+1` on both axes, with `(0, 0)` at the centre and positive y pointing up. An orbit radius of `0.5` reaches halfway to the edge; `1.0` reaches the canvas boundary.

## Speed sliders

Always allow negative values — negative speed runs the animation in reverse.

| | Value |
|---|---|
| Default | `0.15` |
| Min | `-5` |
| Max | `5` |

## Orbit radius

| Situation | Default |
|---|---|
| Centre is fixed at `(0, 0)` | `0.5` |
| Centre is dynamic (driven by another orbit) | `0.25` |

## Colours

Marks that accumulate on the paint layer should use ~50% alpha (`a: 0.5`) so the pattern builds gradually rather than saturating immediately. Full opacity (`a: 1`) is correct for live-layer position indicators.

## Orbit display

For every orbiting body, draw two things:

1. A grey ring on the **live layer** — a circle centred on the orbit's centre point with radius matching the orbit radius. This shows the path the body *will* trace. Redrawn each frame so it always reflects the current orbit parameters.
2. A coloured dot on the **live layer** (no `intervalTicks`) — shows the current position each frame.

Use `{ r: 0.5, g: 0.5, b: 0.5, a: 0.5 }` for the ring. Match the dot colour to the body's `colorPoint` if one exists, otherwise grey.

## Timing units

The engine runs at approximately 60 ticks per second.

- **`intervalTicks`** — a count of ticks, not milliseconds. `intervalTicks: 60` fires roughly once per second.
- **`frequency`** — cycles per 60 ticks. `frequency: 1` completes one full cycle per second; `frequency: 0.5` takes two seconds per cycle.

## Paint interval

`intervalTicks: 10` is a good starting point for lines and marks that accumulate a spirograph pattern. Always expose this as a slider control so the user can tune the density.

## LFO parameters

| Param | Min | Max | Default | Notes |
|-------|-----|-----|---------|-------|
| `amplitude` | `0` | `1` | `0` or very low | Start silent — let the user dial it in |
| `frequency` | `0.001` | `1` | `0.5` | Cycles per 60 ticks. Must never be `0` — zero frequency is meaningless |

## Link rate

Every algorithm must include at least one link rate slider so the user can control how fast marks accumulate on the paint layer.

## Node port defaults

When implementing a node, set defaults that allow it to produce visible output with no params wired. For example:

- A `wave` node should default to a non-zero amplitude and frequency so it oscillates visibly
- An `orbit` node should default to a non-zero radius and speed so it moves
- A render node's `color` default should have non-zero alpha so something is actually drawn

