# Task 03 — module-node: ReflectModule

Use the `module-node` skill to implement `ReflectModule`.

Read handoffs:
- `projects/features/reflect-node/handoffs/task_01_handoff.md` — schema names
- `projects/features/reflect-node/handoffs/task_02_handoff.md` — compute node registration

## Behaviour

The module wraps `ReflectNode` and provides:

1. **Controls** for both `inputPoints` and `reflectionPoints`.
2. **Custom render** of the reflection points (not using the shared point render module):
   - Draw a circle at each reflection point's (x, y) position.
   - Draw a line segment through the point in the direction (dx, dy) — the tangent.
   - Skip (do not render) reflection points where `dx = 0` and `dy = 0`.
3. **Output** — exposes the `ReflectNode`'s `points` output downstream.

## Notes

- The reflection point visualisation is module-internal only — there is no standalone render node for it.
- Follow the `renderControl` / `renderIfNeeded` pattern used by other modules; do not add a separate control node for the render.
