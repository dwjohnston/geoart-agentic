# Task 02 — Compute Node: Implement Multi-Centre Orbit Logic

**Agent:** compute-node-agent
**Status:** TODO
**Depends on:** Task 01 (schema must be updated and types regenerated first)

## Goal

Update the `orbit` compute node implementation to handle the new `centerPoints` input.

## Behaviour

The node now accepts two centre-related inputs:

- `centerPoints` — `colorPointArrayValue` — array of centre points (new, takes precedence)
- `center` — `pointValue` — single centre point (deprecated, backwards compat)

Resolution order (already done inside the graph evaluator — the implementation just reads resolved values):

1. If `centerPoints` is provided and non-empty → use it
2. Else if `center` is provided → wrap it as a single-element array with a default colour (white, fully opaque)
3. Else → use default centre `{x:0.5, y:0.5}` wrapped as above

### Evaluation

For each centre point in the resolved centre array:
- Run the existing orbit calculation using the same `radius`, `speed`, `numPoints`, `phase`, `eccentricity`, `tilt`, `time` inputs
- The colour of each generated point should be inherited from the centre point's colour (r, g, b, a)
- Append the resulting points to the flat output array

### Outputs

- `points` — the full flattened array of all orbit points across all centres
- `point` (deprecated backwards-compat) — `points[0]` if it exists, otherwise the existing fallback default

## Acceptance Criteria

- Existing algorithms that use `center` (single point) still work and produce identical output
- When `centerPoints` has 3 entries and `numPoints` is 2, `points` contains exactly 6 entries
- Output colours per point reflect the colour of their respective centre point
- The deprecated `point` output returns the first element of the flattened array
- Unit / snapshot tests pass
