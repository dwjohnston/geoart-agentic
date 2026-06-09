# define-node handoff: normalise

**Kind:** compute
**Type:** `normalise`
**Description:** Normalises a point cloud into a square bounding box centred on one or more target points.

## Inputs

| Port | Type |
|---|---|
| `inputPoints` | `colorPointArrayValueOrRef` |
| `normalisationCenters` | `colorPointArrayValueOrRef` |
| `normalisationSize` | `numberValueOrRef` |
| `strength` | `numberValueOrRef` (default `0`) |
| `mode` | `normaliseModeEnumValueOrRef` (default `"product"`) |

## Outputs

| Port | Type |
|---|---|
| `points` | `colorPointArrayValue` |

## Behaviour

Given `inputPoints` and one or more `normalisationCenters`:

1. Compute the bounding box of `inputPoints`.
2. `scale = normalisationSize / max(bboxWidth, bboxHeight)` (degenerate bbox → scale = 1).
3. For each input point `p` and each center `c`: `normalised = c + (p - bboxCenter) * scale`.
4. Apply `strength`: `output = lerp(p, normalised, strength)`. `strength=0` is identity; `strength=1` is fully normalised.
5. Output point colors inherit from the corresponding input point; center colors are ignored.

**Mode `product`:** apply normalisation for every center, outputting N×M points (N inputs, M centers).

**Mode `sequential`:** apply each center pass in order, output of pass k is input of pass k+1, outputting N points.

## New enum type

`normaliseModeEnumValue` (`"product" | "sequential"`) was added to `value-kinds.schema.json`.
A `normaliseModeSelector` control node schema entry was added to `schema.json` — the runtime implementation still needs to be created via the `control-node` skill.
