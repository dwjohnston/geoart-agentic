# compute-node handoff: pointsOnALine colorSampler input

## What was done

Updated `src/nodes/compute/nodes/pointsOnALine.ts` to accept an optional `colorSampler` input.

When `colorSampler` is present, each point's colour channels are replaced by calling `colorSampler.sample(t)` where `t` is the same linear interpolation parameter (`i / (count - 1)`) already used for position. When absent, the existing endpoint colour lerp is unchanged.

Tests demonstrate: a sampler returning `{ r: t, g: 0, b: 1-t, a: 1 }` applied to 3 points between `(0,0)` and `(1,1)` yields colours `(0,0,1,1)`, `(0.5,0,0.5,1)`, `(1,0,0,1)` while positions remain `(0,0)`, `(0.5,0.5)`, `(1,1)`.

## Partial algorithm skeleton

```ts
{
  id: 'sampledLine',
  type: 'pointsOnALine',
  params: {
    pointA: { v: { x: 0, y: 0, r: 0, g: 0, b: 0, a: 1, dx: 0, dy: 0 } },
    pointB: { v: { x: 1, y: 1, r: 1, g: 1, b: 1, a: 1, dx: 0, dy: 0 } },
    numberOfPoints: { v: 3 },
    colorSampler: { ref: 'myColorSampler.colorSampler' },
  },
},
```
