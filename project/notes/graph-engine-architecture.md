# GraphEngine Architecture

The `GraphEngine` is a plain JS object that owns the animation loop and all
graph evaluation state. It has no knowledge of React.

## Interface

```ts
GraphEngine(
  orbitCtx: CanvasRenderingContext2D,
  trailCtx: CanvasRenderingContext2D,
  canvasSize: number,
)

load(graph: Graph): ControlRegistration[]
setSpeed(value: number): void
start(): void
stop(): void
```

```ts
type SliderRegistration = {
  node: SliderNode
  setValue: (value: number) => void
}

type ColorPickerRegistration = {
  node: ColorPickerNode
  setValue: (value: ColorValue) => void
}

type ControlRegistration = SliderRegistration | ColorPickerRegistration
```

## Separation of concerns

React is responsible for rendering UI and responding to user input. It is not
a good home for a RAF loop, a compiled graph, or timing accumulators — these
are imperative, stateful, and time-driven in a way that cuts against React's
model. The `GraphEngine` gives that logic a proper home.

The boundary is clean: App.tsx holds only the state needed to render the UI
(`speed`, `registrations`). Everything needed to evaluate the graph lives
inside the engine.

## The engine is loaded, not reconfigured

When the user picks a different graph, `engine.load(graph)` is called. This
recompiles, resets timing, and clears the canvases — a clean slate. The RAF
loop keeps running throughout; it simply picks up the new compiled graph on
the next frame.

This means the engine has no concept of "switching graphs". It only knows how
to evaluate whatever is currently loaded.

## Control registrations

When `load` is called it returns a `ControlRegistration[]` — one entry per
control node in the graph. Each registration pairs the node's metadata (type,
label, min/max, default value) with a pre-bound `setValue` function typed
correctly for that node. The `nodeId` is closed over inside each setter —
nothing outside the engine needs to know it. This gives full type safety at
the call site and keeps the registration a self-contained unit: all the
information needed to render and wire up a control is in one place.

## Speed is not a control node

Speed is a graph-level property, not a node in the graph. It is set directly
on the engine via `setSpeed` and affects the time scaling applied in the RAF
loop. It is not part of the `ControlRegistration` system.

## State map

Each render node can store and retrieve per-frame state via `ctx.getState` /
`ctx.setState`. This state lives inside the engine in a `Map` keyed by node
ID. It is reset when `load` is called, ensuring a new graph always starts
with a blank slate.
