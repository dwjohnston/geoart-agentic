# compute-node handoff: normalisePoints

The `normalisePoints` node fits an array of input points into a bounding box centered on one or more normalisation centers. Each copy is oriented by a normalisation origin point that defines the "up" direction. With a vertical unit line `[(0, -0.5), (0, 0.5)]`, a center at `(0, 0)`, and an origin at `(1, 0)` (right of center), the output rotates CCW 90° to a horizontal line `[(0.5, 0), (-0.5, 0)]` at strength=1.

## Partial algorithm skeleton

```ts
{
  id: 'normalise',
  type: 'normalisePoints',
  params: {
    inputPoints: { ref: 'someLine.points' },
    normalisationCenters: { ref: 'centers.points' },
    normalisationOrigin: { ref: 'origins.points' },
    normalisationSize: { v: 1 },
    strength: { v: 1 },
  },
},
```
