# Task 01: Define normalisePoints Node in Schema

Use the `define-node` skill.

Define a new compute node called `normalisePoints` with the following specification:

## Inputs

- `inputPoints`: `colorPointArrayValueOrRef`
- `normalisationCenters`: `colorPointArrayValueOrRef`
- `normalisationOrigin`: `colorPointArrayValueOrRef`
- `normalisationSize`: `numberValueOrRef` (single uniform value)
- `strength`: `numberValueOrRef` (0–1, default 0)

## Output

- `points`: `colorPointArrayValue`

## Description

Fits an array of input points into a bounding box centered on one or more normalisation centers. For each center and each origin, produces a copy of all input points scaled and rotated to fit. Output cardinality: N input points × M centers × O origins. `strength` lerps between original and normalised positions.

## Handoff

Write the node type name and any generated schema identifiers to `project/features/normalise-points/handoffs/schema.md` for use by task_02.
