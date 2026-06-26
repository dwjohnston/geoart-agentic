# Task 03 — algorithm: Reference graph for points-on-a-line-v2-module

Create `src/algorithms/reference/node_specific/pointsOnALineV2ModuleReferenceGraph.ts`.

## Pattern

Follow the same pattern as `pointsOnALineV2ReferenceGraph.ts` but use the module node instead of the raw compute node.

## Graph

- One `orbit` compute node to produce `colorPoints` (use existing orbit node with sensible defaults)
- One `points-on-a-line-v2-module` module node consuming orbit's `points`
- The module exposes circles internally, so no additional render nodes are needed

See handoff from task 02 at `project/features/points-on-a-line-v2-module/handoffs/module-node.md`.
