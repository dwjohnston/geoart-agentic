# compute-node handoff: normalise

The `normalise` node repositions a point cloud into a square bounding box centred on one or more target points. `strength=0` is identity (output equals input). `strength=1` is fully normalised.

In `product` mode each center produces a separate copy of the input (N×M output points). In `sequential` mode each center applies one pass in sequence (N output points).

## Test values

Single center `(-0.5, -0.5)`, `normalisationSize=1`, `strength=1` maps a 1×1 square centered at the origin into the bottom-left quadrant: corners at `(-1,-1)`, `(0,-1)`, `(0,0)`, `(-1,0)`.

## Partial algorithm skeleton

```ts
{
  id: 'normalise',
  type: 'normalise',
  params: {
    inputPoints: { ref: 'inputOrbit.points' },
    normalisationCenters: {
      v: [{ v: { x: -0.5, y: -0.5, r: 0, g: 0, b: 0, a: 1 } }],
    },
    normalisationSize: { v: 1.0 },
    strength: { v: 1.0 },
    mode: { v: 'product' },
  },
},
```
