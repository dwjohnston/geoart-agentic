# Feature Brief: curveModulator Cycle Length Modes

## Summary

Add `linearTotal` to `cycleLengthModeEnum` and fix `linearOne`. The enum currently has `arrayLength | linearOne`; we need `arrayLength | linearOne | linearTotal`.

## Mode Definitions

| Mode | t range | Behaviour |
|---|---|---|
| `arrayLength` | [0, 1] | `t = i / (n-1)` — index-based, ignores geometry |
| `linearTotal` | [0, 1] | Cumulative Euclidean distance, normalised to total length — always 1 cycle |
| `linearOne` | [0, total_length] | Cumulative Euclidean distance, **not normalised** — a curve of physical length 3 produces t ∈ [0, 3], giving 3 cycles |

"Linear" means straight-line (Euclidean) distance between adjacent points; no curve smoothing is applied.

## Bug

The current `linearOne` implementation calls `calculateDistanceBasedT`, which normalises distances to [0, 1]. This is `linearTotal` behaviour, not `linearOne` behaviour.

## Changes Required

### `src/schema/schema/value-kinds.schema.json`
Add `"linearTotal"` to the `cycleLengthModeEnumValue` enum array.

### `src/nodes/compute/nodes/curveModulator.ts`
- Rename `calculateDistanceBasedT` → `calculateLinearTotalT` (behaviour unchanged — normalises to [0, 1]).
- Add `calculateLinearOneT` — cumulative distance, not normalised (raw Euclidean sum).
- Update the mode dispatch to handle all three modes.

### `src/nodes/compute/nodes/curveModulator.test.ts`
Add new test cases (do not modify existing tests):

1. **`linearOne` — t tracks raw cumulative distance**: 3 collinear points at x=0,1,2 → sampler sees t=[0,1,2].
2. **`linearTotal` — t normalises to [0,1]**: same curve → sampler sees t=[0,0.5,1].
3. **`linearOne` vs `linearTotal` — last t differs**: curve of total length 4; linearOne last t=4.0, linearTotal last t=1.0.
4. **Non-uniform spacing `linearOne`**: x=0,2,3 → t=[0,2,3].
5. **Non-uniform spacing `linearTotal`**: x=0,2,3 → t=[0,2/3,1].
6. **Single point**: both modes return t=[0].

## Out of Scope

- No changes to `arrayLength` behaviour.
- No UI changes — the existing `CycleLengthModeDropdown` control node will need a separate update to expose the new value, but that is a separate task.
- No algorithm updates required.
