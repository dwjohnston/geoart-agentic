# define-node handoff: point-render-module

**Kind:** module
**Type:** `point-render-module`
**Description:** Renders circles and crosshairs for an array of points on the live layer.

## Inputs
| Port | Type |
|---|---|
| `points` | `colorPointArrayValueOrRef` |

## Outputs
None — this is a render-only module.

## Behaviour
For each point in the input array:
1. Draw a circle with radius 0.01 at the point's location on the live layer
2. Draw two perpendicular lines (crosshairs) through the point: one horizontal (0°) and one vertical (90°), each with length 0.1

The module should use render nodes to draw directly to the canvas on the `live` layer.
