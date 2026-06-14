# Task 02 — compute-node: ReflectNode

Use the `compute-node` skill to implement `ReflectNode`.

Read the handoff at `projects/features/reflect-node/handoffs/task_01_handoff.md` for schema context.

## Behaviour

**Inputs:**
- `inputPoints` — `colorPointArrayValueOrRef`
- `reflectionPoints` — `colorPointArrayValueOrRef`

**Output:**
- `points` — `colorPointArrayValue`

**Cardinality:** product — each input point is reflected about every reflection point, yielding N × M output points.

**No-op:** if a reflection point has `dx = 0` and `dy = 0`, skip it — it contributes no output points for any input.

**Geometry:** to reflect point P about a line through R with direction (dx, dy):
1. Translate: P′ = P − R
2. Apply standard 2D line reflection about the direction vector (dx, dy):
   - Let d = (dx, dy) normalised
   - reflected = 2 * dot(P′, d) * d − P′
3. Translate back: result = reflected + R

**Color:** output point inherits the color of the input point unchanged.

## Handoff

Write a handoff to `projects/features/reflect-node/handoffs/task_02_handoff.md` confirming the node is implemented and registered.
