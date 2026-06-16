# compute-node handoff: orbit colorSampler input (task_05)

## What was done

The `orbit` compute node (`src/nodes/compute/nodes/orbit.ts`) now supports an optional `colorSampler` input.

When `colorSampler` is absent, colours are inherited from the centre point as before (backwards-compatible).

When `colorSampler` is present, each orbit point at index `i` samples `t = i / numPoints` (range [0, 1)) and calls `colorSampler.sample(t)` to get `{ r, g, b, a }`, replacing the inherited centre colour. Mode is `clobber` — full replacement. Position and tangent are unaffected.

When multiple centre points are used, each sub-orbit independently samples `i` from 0 to `numPoints-1`.

## Test values

With `numPoints: 4` and a linear sampler (`r=t, g=1-t, b=0, a=1`):
- Point 0: `t = 0/4 = 0` → `{ r: 0, g: 1, b: 0, a: 1 }`
- Point 2: `t = 2/4 = 0.5` → `{ r: 0.5, g: 0.5, b: 0, a: 1 }`

## Algorithm skeleton

```ts
{
  id: 'myOrbit',
  type: 'orbit',
  params: {
    radius: { v: 0.5 },
    numPoints: { v: 4 },
    colorSampler: { ref: 'myColorSampler.colorSampler' },
  },
},
```
