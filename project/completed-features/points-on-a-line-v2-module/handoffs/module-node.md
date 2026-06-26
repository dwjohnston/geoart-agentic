# module-node handoff: points-on-a-line-v2-module

## Description

The module wraps a `pointsOnALineV2` compute node and a `circle` render node.

- **Compute node** (`pointsOnALineV2`) — distributes `numPoints` evenly along the path defined by `colorPoints`, using either straight polyline or Catmull-Rom spline interpolation depending on `curveMode`.
- **Render node** (`circle`, live layer, displayed by default) — draws a circle at each output point.
- **Controls** — `curveMode` dropdown and `numPoints` knob, rendered only when those ports are wired internally.

Outputs `points` (the distributed colour point array) via the output marker.

## Partial algorithm skeleton

```ts
.addModuleNode({
  id: 'poal',
  type: 'points-on-a-line-v2-module',
  params: {
    colorPoints: { ref: 'orbit.points' },
    numPoints: { v: 20 },
    curveMode: { v: 'straight' },
  },
})
```
