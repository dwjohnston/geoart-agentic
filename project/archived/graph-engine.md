# GraphEngine — Extract animation loop and graph evaluation from App.tsx

## Problem

`App.tsx` currently owns too much imperative logic: the RAF loop, graph compilation,
timing accumulators, the node state map, control value mutation, and canvas clearing.
This makes it hard to reason about and test. Most of it is not React — it just happens
to live inside a React component.

## Goal

Extract all of that into a pure JS `GraphEngine` object. App.tsx becomes thin React
glue: state for rendering, wiring user events to engine calls.

## Interface

### Construction

```ts
GraphEngine(
  orbitCtx: CanvasRenderingContext2D,
  trailCtx: CanvasRenderingContext2D,
  canvasSize: number,
)
```

Canvas contexts are fixed for the lifetime of the engine.

### Methods

```ts
load(graph: Graph): ControlRegistration[]
```

Compiles the graph, resets timing, clears both canvases, resets the node state map.
Returns control registrations (see below). The RAF loop keeps running — `load` swaps
what is being evaluated without restarting the loop.

```ts
setSpeed(value: number): void
start(): void
stop(): void
```

`start` / `stop` are called from App's `useEffect` mount / cleanup.

### Control registrations

`load` returns a discriminated union per control node — pairing node metadata with a
pre-bound, correctly-typed setter. No `nodeId` threading at call sites.

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

The engine closes over the `nodeId` internally when building each setter. Callers get
full type safety without knowing node identifiers.

## What moves out of App.tsx

| Currently in App.tsx | Moves to |
|---|---|
| `compiledRef` | GraphEngine |
| `stateMapRef` | GraphEngine |
| `startTimeRef`, `prevTimeRef`, `scaledElapsedRef`, `speedRef` | GraphEngine |
| RAF loop (`useEffect`) | GraphEngine |
| `handleSliderChange`, `handleColorPickerChange` | Replaced by `registration.setValue` |
| `sliderValues`, `colorValues` state | Collapsed into `registrations` state |
| `initSliderValues`, `initColorValues` | GraphEngine (internal) |

## What stays in App.tsx

- `registrations` state (drives Controls rendering)
- `speed` state (drives SpeedControl rendering)
- Canvas refs (passed to engine at mount)
- `handleGraphChange` — calls `engine.load(graph)`, sets returned registrations + speed
- `handleSpeedChange` — calls `engine.setSpeed(value)`
- Mount effect: `engine.start()` / `engine.stop()`
