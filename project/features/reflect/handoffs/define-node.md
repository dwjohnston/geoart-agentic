# define-node handoff: reflect

**Kind:** compute
**Type:** `reflect`
**Description:** Reflects an array of input points about one or more reflection points.

## Inputs
| Port | Type |
|---|---|
| `inputPoints` | `colorPointArrayValueOrRef` |
| `reflectionPoints` | `colorPointArrayValueOrRef` |

## Outputs
| Port | Type |
|---|---|
| `points` | `colorPointArrayValue` |

## Behaviour
Product cardinality — each input point is reflected about every reflection point, giving N × M output points.

Geometry: to reflect point P about a line through R with direction (dx, dy), translate P by -R, apply standard line reflection (formula: P_reflected = 2*(P·L̂)*L̂ - P where L̂ is the unit direction vector), translate back by +R.

The `dx`/`dy` tangent field of each reflection point defines the mirror line direction through that point. `dx=dy=0` is a no-op for that reflection point. Output points inherit the colour of the corresponding input point. The tangent vector (dx, dy) of each output point is also reflected.
