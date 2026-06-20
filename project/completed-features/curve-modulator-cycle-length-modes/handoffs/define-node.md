# define-node handoff: cycleLengthModeEnumValue update

**Kind:** value primitive (enum)
**Type:** `cycleLengthModeEnumValue`
**Description:** Enum controlling how the `curveModulator` node determines cycle length.

## Updated Enum Values

| Value | Meaning |
|---|---|
| `arrayLength` | t = i / (n-1) — index-based, range [0, 1] |
| `linearOne` | Cumulative Euclidean distance, not normalised — range [0, total_length] |
| `linearTotal` | Cumulative Euclidean distance, normalised — range [0, 1], always 1 cycle |

## Change Made

Added `"linearTotal"` to the `cycleLengthModeEnumValue` enum in `value-kinds.schema.json`. Generated types updated — `V_cycleLengthModeEnumValue` now includes `"linearTotal"`.
