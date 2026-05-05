# GraphEngine Architecture

The `GraphEngine` is a plain JS object that owns graph compilation, timing
accumulation, and per-frame drawing. It has no knowledge of React and no
dependency on `requestAnimationFrame`.

## Interface

```ts
createGraphEngine(
  orbitCtx: CanvasRenderingContext2D,
  trailCtx: CanvasRenderingContext2D,
  canvasSize: number,
): GraphEngine

load(graph: Graph): ControlRegistration[]
setSpeed(value: number): void
tick(wallMs: number): void
```

```ts
type SliderRegistration = {
  type: 'slider'
  node: SliderNode
  setValue: (value: number) => void
}

type ColorPickerRegistration = {
  type: 'colorPicker'
  node: ColorPickerNode
  setValue: (value: ColorValue) => void
}

type ControlRegistration = SliderRegistration | ColorPickerRegistration
```

## Separation of concerns

The engine owns all imperative state: the compiled graph, timing accumulators,
and canvas drawing. App.tsx owns the animation loop and the React state needed
to render the UI (`speed`, `registrations`).

The `requestAnimationFrame` loop lives in App.tsx. On each frame, App calls
`engine.tick(wallMs)` with the raw wall-clock timestamp from RAF. The engine
converts that to scaled elapsed time internally and draws the frame.

This split means the engine is easy to drive from outside React — in tests,
from a worker, or on a different schedule — without any React dependency.

## tick(wallMs)

`tick` is the single entry point for drawing. It:

1. Computes delta time from the previous call
2. Applies speed scaling to advance `scaledElapsed`
3. Clears the orbit canvas
4. Builds an `EvalContext` and calls the graph evaluator

The engine tracks `startTime`, `prevTime`, and `scaledElapsed` internally.
These are reset by `load()`.

## The engine is loaded, not reconfigured

When the user picks a different graph, `engine.load(graph)` is called. This
recompiles, resets timing, and clears both canvases — a clean slate. The RAF
loop in App.tsx keeps running uninterrupted; `tick` simply evaluates whatever
is currently loaded.

The engine has no concept of "switching graphs". It only knows how to evaluate
whatever is currently loaded.

## Control registrations

`load` returns a `ControlRegistration[]` — one entry per control node in the
graph. Each registration is a discriminated union (`type: 'slider'` or
`type: 'colorPicker'`) pairing node metadata with a pre-bound `setValue`
function typed correctly for that node. The `nodeId` is closed over inside
each setter — nothing outside the engine needs to know it.

The `type` discriminant enables TypeScript to narrow the union at the call
site without type assertions.

## Speed is not a control node

Speed is a graph-level property, not a node. It is set on the engine via
`setSpeed` and affects the time scaling inside `tick`. It is not part of the
`ControlRegistration` system.

## Node-local state

Each compute node can store and retrieve per-frame state via `ctx.getState` /
`ctx.setState`. This is scoped per node by the evaluator using `_nodeLocalState`
on the node's `NodeState` entry — the engine does not manage a separate state
map for this purpose.
