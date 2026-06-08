# Feature Brief: Normalise Compute Node

## Summary

A compute node that fits an array of input points into a square bounding box centred on one or more normalisation centers.

## Inputs

| Port | Type | Notes |
|---|---|---|
| `inputPoints` | `colorPointArrayValueOrRef` | Points to normalise |
| `normalisationCenters` | `colorPointArrayValueOrRef` | One or more target centers |
| `normalisationSize` | `numberValueOrRef` | Full side length of the target bounding box |
| `strength` | `numberValueOrRef` | 0–1, default 0 (identity). Lerps between original positions (0) and fully normalised positions (1) |
| `mode` | `"product" \| "sequential"` | Default: `"product"` |

## Output

| Port | Type |
|---|---|
| `points` | `colorPointArrayValue` |

## Behaviour

### Normalisation

The input points are scaled and translated so their bounding box fits within a square of side `normalisationSize` centred on the target normalisation center. The aspect ratio of the input point cloud is preserved (fit within, not stretch to fill). `strength` lerps between original positions (0) and fully normalised positions (1).

Example: `normalisationCenter = (0.5, 0.5)`, `normalisationSize = 0.5` → target box `(0.25, 0.25)` to `(0.75, 0.75)`.

### Mode: `product` (default)

For each normalisation center, produce a copy of all input points normalised to that center.

Cardinality: N input points × M centers → N×M output points.

### Mode: `sequential`

Apply normalisation to each center in sequence: the output of fitting to center _k_ becomes the input for center _k+1_.

Cardinality: N input points → N output points.

## Color

Output points inherit the colors of their corresponding input points. Normalisation center colors are ignored.

## Typical Usage

A single normalisation center maps N → N points (translate + scale the shape). Multiple centers replicate the shape at each center (stamp operation).

## Examples

### 1. Single center — translate and scale a shape (N → N)

```
inputPoints:          (0.0,0.0), (1.0,0.0), (1.0,1.0), (0.0,1.0)   — unit square
normalisationCenters: (0.25, 0.25)
normalisationSize:    0.5
strength:             1.0
mode:                 product
```

Input bbox side 1.0, scale = 0.5. Shape is placed in the bottom-left quadrant.

```
Input      → Output
(0.0, 0.0) → (0.0,  0.0)
(1.0, 0.0) → (0.5,  0.0)
(1.0, 1.0) → (0.5,  0.5)
(0.0, 1.0) → (0.0,  0.5)
```

4 inputs × 1 center → 4 outputs.

---

### 2. Product mode — stamp a shape at multiple centers (N×M)

```
inputPoints:          (0.0,0.0), (1.0,0.0), (1.0,1.0), (0.0,1.0)   — unit square
normalisationCenters: (0.25,0.25), (0.75,0.25), (0.5,0.75)
normalisationSize:    0.5
strength:             1.0
mode:                 product
```

Input bbox side 1.0, scale = 0.5. Three copies are placed at each center.

```
Center (0.25, 0.25):
  (0.0, 0.0) → (0.0,  0.0)
  (1.0, 0.0) → (0.5,  0.0)
  (1.0, 1.0) → (0.5,  0.5)
  (0.0, 1.0) → (0.0,  0.5)

Center (0.75, 0.25):
  (0.0, 0.0) → (0.5,  0.0)
  (1.0, 0.0) → (1.0,  0.0)
  (1.0, 1.0) → (1.0,  0.5)
  (0.0, 1.0) → (0.5,  0.5)

Center (0.5, 0.75):
  (0.0, 0.0) → (0.25, 0.5)
  (1.0, 0.0) → (0.75, 0.5)
  (1.0, 1.0) → (0.75, 1.0)
  (0.0, 1.0) → (0.25, 1.0)
```

4 inputs × 3 centers → 12 outputs.

---

### 3. Sequential mode — progressively reposition (N → N)

At `strength=1.0` sequential collapses to a single normalisation around the last center. `strength < 1.0` makes each pass a partial nudge, so intermediate centers have a real effect.

```
inputPoints:          (0.0,0.0), (0.5,0.0), (0.5,0.5), (0.0,0.5)   — 0.5×0.5 square
normalisationCenters: (0.75,0.75), (0.5,0.0)
normalisationSize:    0.5
strength:             0.5
mode:                 sequential
```

Input bbox is already 0.5×0.5 so scale = 1.0 throughout; each pass is a translate-only nudge at 50% strength.

```
After pass 1 — nudge 50% toward (0.75, 0.75):
  (0.0, 0.0) → (0.25, 0.25)
  (0.5, 0.0) → (0.75, 0.25)
  (0.5, 0.5) → (0.75, 0.75)
  (0.0, 0.5) → (0.25, 0.75)

After pass 2 — nudge 50% toward (0.5, 0.0):
  (0.25, 0.25) → (0.25, 0.0)
  (0.75, 0.25) → (0.75, 0.0)
  (0.75, 0.75) → (0.75, 0.5)
  (0.25, 0.75) → (0.25, 0.5)
```

4 inputs → 4 outputs. The result is not reachable by any single-pass `product` normalisation.

---

## Out of Scope

- Non-uniform scaling (x and y scaled independently)
- Rotation
- Any effect from normalisation center color
