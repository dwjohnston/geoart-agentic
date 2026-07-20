# define-node handoff: normalisePoints

**Kind:** compute
**Type:** `normalisePoints`
**Description:** Fits an array of input points into a bounding box centered on one or more normalisation centers, with orientation determined by normalisation origin points. Product cardinality: N × M × O.

## Inputs

| Port | Type |
|---|---|
| `inputPoints` | `colorPointArrayValueOrRef` |
| `normalisationCenters` | `colorPointArrayValueOrRef` |
| `normalisationOrigin` | `colorPointArrayValueOrRef` |
| `normalisationSize` | `numberValueOrRef` |
| `strength` | `numberValueOrRef` |

## Outputs

| Port | Type |
|---|---|
| `points` | `colorPointArrayValue` |

## Behaviour

For each normalisation center (M) and each normalisation origin (O), produce a copy of all N input points fitted to that center:

1. Compute bounding box of `inputPoints`.
2. Scale so the bounding box fits within `normalisationSize` (uniform scale, fit to smaller axis).
3. Rotate so the direction from the input centroid to a reference "up" direction maps to the direction from center to origin.
4. Translate centroid to the normalisation center.
5. Lerp each point between original position (`strength=0`) and normalised position (`strength=1`).
6. Preserve colors throughout.

Output: N × M × O points. `strength=0` → identity (original positions repeated M×O times).

## Edge cases

- `normalisationSize = 0` → all points collapse to center.
- All input points coincident (zero bounding box) → skip scaling.
- Empty `normalisationCenters` or `normalisationOrigin` → empty output.
