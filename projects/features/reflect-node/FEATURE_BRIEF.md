# Feature Brief: Reflect Node

## Overview

Add a `ReflectNode` compute node and a `ReflectModule` module node to the engine.

---

## ReflectNode (compute)

**Schema name:** `ReflectNode`

### Inputs

| Name | Type |
|---|---|
| `inputPoints` | `colorPointArrayValueOrRef` |
| `reflectionPoints` | `colorPointArrayValueOrRef` |

### Output

| Name | Type |
|---|---|
| `points` | `colorPointArrayValue` |

### Behaviour

- **Cardinality:** product — each input point is reflected about every reflection point, yielding N × M output points.
- **Geometry:** to reflect point P about a line through R with direction (dx, dy):
  1. Translate: P′ = P − R
  2. Apply standard 2D line reflection about the direction vector (dx, dy)
  3. Translate back: result = P′ + R
- **Color:** output point inherits the color of the input point; reflection does not alter color.
- **No-op:** if a reflection point has `dx = 0` and `dy = 0`, it is skipped entirely — it contributes no output points for any input.

---

## ReflectModule (module)

**Schema name:** `ReflectModule`

### Controls

The module provides full controls for both `inputPoints` and `reflectionPoints`.

### Reflection point render

The module renders each reflection point using a custom visualisation (not the shared point render module):

- A circle at the point's position.
- A line segment showing the tangent direction (dx, dy) through the point.
- Reflection points with `dx = 0` and `dy = 0` are **not rendered**.

### Output

Exposes the computed reflected point array for use downstream.

---

## Out of scope

- No standalone render node for reflection points — the visualisation lives inside `ReflectModule` only.
- No blending or mixing of input and reflection point colors.
