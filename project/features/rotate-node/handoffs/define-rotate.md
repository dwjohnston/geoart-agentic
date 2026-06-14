# define-node handoff: rotate

**Kind:** compute
**Type:** `rotate`
**Description:** Rotates an array of input points about one or more rotation centres using product cardinality.

## Inputs
| Port | Type |
|---|---|
| `inputPoints` | `colorPointArrayValueOrRef` |
| `rotationCentres` | `colorPointArrayValueOrRef` |
| `rotationAmount` | `numberValueOrRef` |

## Outputs
| Port | Type |
|---|---|
| `points` | `colorPointArrayValue` |

## Behaviour
Product cardinality — each input point is rotated about every rotation centre. Output length = `inputPoints.length × rotationCentres.length`. `rotationAmount` is 0–1 where 1.0 = full 360° (2π radians). Output colour is taken from `inputPoints`.
