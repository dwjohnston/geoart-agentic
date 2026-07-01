# Task 02: Implement normalisePoints Compute Node

Use the `compute-node` skill.

Read `project/features/normalise-points/handoffs/schema.md` for the node type name from task_01.

## Behaviour

For each normalisation center (M centers), for each normalisation origin (O origins):
1. Compute the bounding box of `inputPoints`.
2. Scale the input points so that the bounding box fits within `normalisationSize` (uniform scale, preserving aspect ratio — fit to the smaller axis).
3. Rotate the scaled points so that the direction from the bounding box centroid to the first input centroid maps to the direction from the center to the origin.
4. Translate so the centroid lands on the normalisation center.
5. Lerp each point between its original position and its normalised position using `strength`.
6. Preserve input point colors throughout.

Output cardinality: N × M × O points.

`strength = 0` → identity (output equals input repeated M×O times).
`strength = 1` → fully normalised.

## Reference for orientation

The normalisation origin defines "up" for the fitted copy. The angle from center to origin is used to rotate the fitted point cloud. For example:
- origin directly above center → no rotation (upward facing)
- origin to the left of center → 90° clockwise rotation (leftward facing)

## Edge cases

- If `normalisationSize = 0`, all output points collapse to the center.
- If `inputPoints` has a zero-size bounding box (all points coincident), skip scaling (treat as already a unit point).
- If `normalisationCenters` or `normalisationOrigin` is empty, output is empty.

## Tests

Write tests covering:
1. Single center, single origin, strength=1 → points fit to normalisationSize around center
2. Single center, three origins → three sets of points with correct orientations
3. strength=0 → output equals input (positions unchanged) for each center/origin combo
4. strength=0.5 → lerped positions
5. Zero-size bounding box edge case
