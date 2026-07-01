# Task 02 — compute-node: NormaliseNode

Use the `compute-node` skill to implement `NormaliseNode`.

Read the handoff at `project/features/normalise-node/handoffs/define-node.md` for schema context.

## Behaviour

**Inputs:**
- `inputPoints` — `colorPointArrayValueOrRef`
- `normalisationCenters` — `colorPointArrayValueOrRef`
- `normalisationOrigin` — `colorPointArrayValueOrRef`
- `normalisationSize` — `numberValueOrRef`
- `strength` — `numberValueOrRef` (0–1, default 0 = identity)

**Output:**
- `points` — `colorPointArrayValue`

**Cardinality:** product — for each normalisation center, for each normalisation origin, a copy of all input points is fitted to that center, yielding N × M × O output points.

**Fitting:**
1. Compute the bounding box of `inputPoints` and its center (the pivot).
2. Direction = `origin − center`, normalised. This is where the shape's own "up" (+y) axis is rotated to point. If `origin` coincides with `center` (zero-length direction), skip that center/origin pair entirely — no outputs for it.
3. Rotate all input points about the pivot so "up" aligns with that direction.
4. Recompute the bounding box of the rotated points; scale uniformly (preserving aspect ratio) so its longest side equals `normalisationSize`.
5. Translate so the scaled bounding box is centered on the normalisation center.
6. Tangents (dx, dy) are rotated and scaled the same way as positions (translation does not apply to them).
7. A degenerate (single-point) bounding box has zero size — skip scaling (treat as scale = 1) and the point ends up exactly on the normalisation center.

**Strength:** clamp to [0, 1]; lerp each output coordinate between the original position and the fully-normalised position computed above.

**Color:** output point inherits the color of the input point unchanged; normalisation centers/origins' colors are unused.

## Handoff

Write a handoff to `project/features/normalise-node/handoffs/compute-node.md` confirming the node is implemented and registered.
