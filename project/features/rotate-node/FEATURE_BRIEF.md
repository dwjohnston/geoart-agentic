# Feature Brief: rotate-node

## Summary

Add a `rotate` compute node and a `rotate-module` module node.

The `rotate` compute node rotates an array of input points about one or more rotation centers. It uses product cardinality — each input point is rotated about every rotation center, giving N × M output points.

The `rotate-module` wraps the compute node and also renders a circle outline at each rotation center.

## Nodes

### `rotate` (compute node)

**Inputs:**
- `inputPoints: colorPointArrayValueOrRef`
- `rotationCenters: colorPointArrayValueOrRef`
- `rotationAmount: numberValueOrRef` — 0–1, where 1.0 = full 360°

**Output:**
- `points: colorPointArrayValue`

**Behaviour:** Product cardinality — each input point is rotated about every rotation center. Output length = `inputPoints.length × rotationCenters.length`. Output colour is taken from `inputPoints`.

### `rotate-module` (module node)

Contains the `rotate` compute node. Renders a circle outline at each rotation center point.

## Test Cases

| Inputs | Expected output |
|---|---|
| `inputPoints: [(1,0,red)]`, `rotationCenters: [(0,0,white)]`, `rotationAmount: 0` | `[(1, 0, red)]` — identity |
| `inputPoints: [(1,0,red)]`, `rotationCenters: [(0,0,white)]`, `rotationAmount: 0.25` | `[(0, 1, red)]` — 90° CCW about origin |
| `inputPoints: [(1,0,red), (0,1,blue)]`, `rotationCenters: [(0,0,white), (0.5,0,white)]`, `rotationAmount: 0.25` | `[(0,1,red), (-1,0,blue), (0.5,0.5,red), (-0.5,-0.5,blue)]` — 4 outputs, 90° CCW about each centre |

## Reference Algorithm

- `orbit-module` → `inputPoints`
- `wave-module` → `rotationAmount`
- Single fixed point at `(0.25, 0.25)` → `rotationCenters`
- `rotate` compute node output → `dots` render node on `live` layer
- `rotate-module` also renders a circle outline at each rotation center
