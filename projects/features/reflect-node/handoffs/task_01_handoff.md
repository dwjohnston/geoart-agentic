# define-node handoff: reflect-node

## ReflectNode (compute)

**Kind:** compute
**Type string:** `reflect`
**Schema name:** `ReflectNode`
**Description:** Reflects an array of input points about one or more reflection points using product cardinality.

### Inputs
| Port | Type |
|---|---|
| `inputPoints` | `colorPointArrayValueOrRef` |
| `reflectionPoints` | `colorPointArrayValueOrRef` |

### Outputs
| Port | Type |
|---|---|
| `points` | `colorPointArrayValue` |

### Behaviour
- Product cardinality: each input point is reflected about every reflection point → N × M outputs.
- Reflection geometry: translate P by −R, apply 2D line reflection about normalised (dx, dy), translate back by +R.
- If dx=0 and dy=0 on a reflection point, skip it entirely (no outputs for that pair).
- Output point inherits the input point's color unchanged.

---

## ReflectModule (module)

**Kind:** module
**Type string:** `reflect-module`
**Schema name:** `ReflectModule`
**Description:** Module that wraps ReflectNode with controls and custom reflection-point visualisation.

### Inputs
| Port | Type |
|---|---|
| `inputPoints` | `colorPointArrayValueOrRef` |
| `reflectionPoints` | `colorPointArrayValueOrRef` |

### Outputs
| Port | Type |
|---|---|
| `points` | `colorPointArrayValue` |

---

## Notes
- No new value types were introduced; both nodes use existing `colorPointArrayValueOrRef` / `colorPointArrayValue`.
- `bun generate` ran successfully; `bun validate` passes (448 tests, schema valid, typecheck clean).
