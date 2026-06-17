# compute-node handoff: curveModulator cycle length modes

The `curveModulator` node now correctly implements all three `cycleLengthMode` values.

- `arrayLength`: t = i / (n-1), range [0, 1] — unchanged.
- `linearTotal`: cumulative Euclidean distance normalised to [0, 1] — always 1 cycle. A 3-point collinear curve at x=0,1,2 produces t=[0, 0.5, 1].
- `linearOne`: cumulative Euclidean distance, not normalised — n cycles for total length n. Same curve produces t=[0, 1, 2].

The former `calculateDistanceBasedT` (which was incorrectly wired to `linearOne`) is now `calculateLinearTotalT`. The new `calculateLinearOneT` returns raw cumulative distances.
