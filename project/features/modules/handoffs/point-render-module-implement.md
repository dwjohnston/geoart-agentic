# module-node handoff: point-render-module

**Module type:** `point-render-module`

## Module summary

The point-render-module expands into a set of render nodes that visualise an array of points by drawing circles and crosshairs for each point on the live layer.

## Internal nodes

The module provides the following internal nodes:

- **colorPointArrayCompute** (id: `{moduleId}:add-gradient`) — passes through the input points array
- **circle** (id: `{moduleId}:circles`) — renders circles at each point with radius 0.01
- **linesThroughPoint** (id: `{moduleId}:crosshairs`) — renders perpendicular lines (0° and 90°) through each point with length 0.1

All render nodes draw to the `live` layer.

## Inputs

- `points` — array of colour points

## Outputs

None — this module is render-only and produces no output values.

## Behaviour spec

For each point in the input array:
1. Draw a circle with radius 0.01 at the point's location
2. Draw two perpendicular lines (crosshairs) through the point: one at 0° and one at 90°, each with length 0.1

The crosshairs depend on the point's gradient information (dx, dy). If a point lacks gradient info, the linesThroughPoint render node will skip drawing lines through that point.

## Example usage

```ts
.addModuleNode({
  id: 'pointDisplay',
  type: 'point-render-module',
  params: {
    points: { ref: 'orbitNode.points' }
  },
})
```
