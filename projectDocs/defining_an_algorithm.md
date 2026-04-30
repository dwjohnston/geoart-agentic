# Defining an Algorithm

An algorithm is a TypeScript file in `src/graphs/` that exports a plain `GeoArtGraph` data structure. It has no logic of its own — it is purely declarative wiring.

## File structure

```ts
import type { GeoArtGraph } from '../schema/_generated/schema-types';

export const myAlgorithmGraph: GeoArtGraph = {
  version: '2.0',
  control: { nodes: [...] },
  compute: { nodes: [...] },
  render:  { nodes: [...] },
};
```

TypeScript enforces the shape of each node and its params. It cannot verify that a `ref` points to a port that exists — that is the compiler's job.

---

## The three sections

### `control`

User-facing inputs. Their params are **static values only** — control nodes sit at the top of the data flow and nothing can ref into them.

```ts
{
  id: 'speedSlider',
  type: 'slider',
  params: {
    label: { v: 'Speed' },
    min:   { v: -1 },
    max:   { v: 1 },
    step:  { v: 0.01 },
    value: { v: 0.2 },
  },
},
```

Always allow negative `value` on speed sliders — negative runs the animation in reverse.

### `compute`

Pure mathematical transforms. Params can be static values or refs to other nodes' output ports.

```ts
{ id: 'time', type: 'time', params: {} },
{
  id: 'earthOrbit',
  type: 'orbit',
  params: {
    time:   { ref: 'time.time' },
    radius: { ref: 'distanceSlider.value' },
    speed:  { ref: 'speedSlider.value' },
  },
},
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
{
  id: 'line',
  type: 'timedLine',
  renderConfig: { layer: 'paint' },
  params: {
    colorPointA: { ref: 'earthColorPoint.colorPoint' },
    colorPointB: { ref: 'venusColorPoint.colorPoint' },
  },
},
// Current-position dot — live layer, redrawn each frame
{
  id: 'earthDot',
  type: 'circle',
  renderConfig: { layer: 'live' },
  params: {
    center: { ref: 'earthOrbit.point' },
    radius: { v: 0.02 },
    color:  { v: { r: 0.3, g: 0.7, b: 1, a: 1 } },
  },
},
```

---

See [Sensible Defaults](sensible_defaults.md) for conventions on coordinates, colours, orbit display, paint intervals, and LFO ranges.

---

## Registering the algorithm

Add an entry to the `GRAPHS` array in `src/graphs/index.ts`:

```ts
import { myAlgorithmGraph } from './myAlgorithm';

export const GRAPHS: GraphEntry[] = [
  // ...existing entries...
  { id: 'myAlgorithm', name: 'My Algorithm', graph: myAlgorithmGraph },
];
```

The UI reads this array to populate the algorithm selector. The `id` is used for serialisation — do not change it once the algorithm ships.
