# define-node handoff: color-shift-module

**Kind:** module
**Type:** `color-shift-module`
**Description:** Module that applies inverse-distance weighted colour shifting to an array of points.

## Inputs
| Port | Type |
|---|---|
| `inputPoints` | `colorPointArrayValueOrRef` |
| `targetPoints` | `colorPointArrayValueOrRef` |
| `falloff` | `numberValueOrRef` |
| `strength` | `numberValueOrRef` |

## Outputs
| Port | Type |
|---|---|
| `points` | `colorPointArrayValue` |

## Behaviour
Wraps the `colorShift` compute node. For each point in `inputPoints`, blends each colour channel toward the nearest points in `targetPoints` using inverse-distance weighting. `falloff` controls how sharply the influence drops with distance; `strength` (clamped 0–1) scales the overall blend. Outputs the shifted point array as `points`.
