# Task 02 — compute-node: Fix and implement all three cycle length modes

## Goal

Update `src/nodes/compute/nodes/curveModulator.ts` to correctly implement all three modes, and add new tests to `curveModulator.test.ts`.

## Mode Definitions

| Mode | t range | Calculation |
|---|---|---|
| `arrayLength` | [0, 1] | `t = i / (n-1)` — index-based |
| `linearTotal` | [0, 1] | Cumulative Euclidean distance, normalised — always 1 cycle |
| `linearOne` | [0, total_length] | Cumulative Euclidean distance, **not** normalised — n cycles for length n |

"Linear" = straight Euclidean distance between adjacent points. No curve smoothing.

## Changes to `curveModulator.ts`

1. Rename `calculateDistanceBasedT` → `calculateLinearTotalT`. Behaviour unchanged (normalises to [0, 1]).

2. Add `calculateLinearOneT`:
   - Returns cumulative Euclidean distance at each point, not normalised.
   - `distances[0] = 0`, `distances[i] = distances[i-1] + euclidean(point[i], point[i-1])`.
   - Edge cases: empty array → `[]`; single point → `[0]`.

3. Update the dispatch in `evaluate`:
   - `'linearOne'` → `calculateLinearOneT(curve)`
   - `'linearTotal'` → `calculateLinearTotalT(curve)`
   - `'arrayLength'` (default) → `calculateArrayLengthT(curve)`

## New Tests to Add to `curveModulator.test.ts`

Do not modify existing tests. Add a new `describe` block: `'cycle length modes'`.

### Test 1 — `linearOne` t values are raw cumulative distances
Curve: 3 collinear points at x=0, x=1, x=2 (all y=0).
Record each t passed to sampler.
Expected sampler t calls: `[0, 1, 2]` (within tolerance 0.01).

### Test 2 — `linearTotal` t values are normalised to [0, 1]
Same curve (x=0, x=1, x=2).
Expected sampler t calls: `[0, 0.5, 1]`.

### Test 3 — `linearOne` last t equals total curve length
Curve: 5 collinear points at x=0,1,2,3,4 (total length = 4).
Last sampler t call should be `4.0`.

### Test 4 — `linearTotal` last t is always 1
Same curve (total length = 4).
Last sampler t call should be `1.0`.

### Test 5 — `linearOne` non-uniform spacing
Curve: x=0, x=2, x=3 → expected t: `[0, 2, 3]`.

### Test 6 — `linearTotal` non-uniform spacing
Same curve → expected t: `[0, 2/3, 1]`.

### Test 7 — single point, `linearOne`
Curve: 1 point. Sampler should be called with t=0.

### Test 8 — single point, `linearTotal`
Curve: 1 point. Sampler should be called with t=0.

## Validation

Run `bun test curveModulator` — all existing and new tests must pass.
Run `bun typecheck`.
