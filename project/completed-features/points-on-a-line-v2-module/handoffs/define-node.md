# define-node handoff: points-on-a-line-v2-module

**Kind:** module
**Type:** `points-on-a-line-v2-module`
**Description:** Distributes points along a polyline or Catmull-Rom spline defined by colour control points.

## Inputs
| Port | Type |
|---|---|
| `colorPoints` | `colorPointArrayValueOrRef` |
| `numPoints` | `numberValueOrRef` |
| `curveMode` | `curveModeEnumValueOrRef` |

## Outputs
| Port | Type |
|---|---|
| `points` | `colorPointArrayValue` |

## Behaviour
Wraps the `pointsOnALineV2` compute node. Distributes `numPoints` evenly along the path defined by `colorPoints`. When `curveMode` is `'straight'` the path is a polyline; when `'catmull-rom'` it is a Catmull-Rom spline. The module renders circles at each output point.
