# Task 01: Render module nodes in the graph view (direct — no node-lifecycle skill applies)

## Goal

`src/application/GraphView.tsx` ignores `graph.module.nodes` entirely. Module nodes (e.g.
`orbit-module`) must appear as cards in the graph view, in their own "Module" column, with
correct input/output ports and connection edges to/from control, compute, render and other
module nodes.

## Changes

1. `src/application/GraphView.tsx`
   - Read `graph.module?.nodes ?? []` as `moduleNodes`.
   - Include `moduleNodes` in `collectConnections`'s `allNodes` so refs into/out of module nodes
     are captured.
   - Generalise `assignComputeColumns` into a dependency-leveling helper usable for both compute
     and module nodes (level by same-layer refs only).
   - In `computeLayout`, level and barycenter-sort module nodes into columns positioned after the
     compute columns, updating `rowOf` with module rows before sorting the render column (so
     render nodes referencing module outputs sort sensibly).
   - Render a `Column title="Module"` per module column, between the compute columns and the
     render column.
2. `src/application/NodeCard.tsx` — add `'module'` to the `layerKind` union and give it its own
   entries in `LAYER_COLOURS` / `LAYER_TITLE_COLOURS` (visually distinct from control/compute/render).
3. Tests in `src/application/GraphView.browser.test.tsx` — add cases using the existing module
   reference graphs (do not invent new fixtures):
   - `src/algorithms/reference/module/singleModule.ts` — module node card renders, with a
     control/compute → module edge.
   - `src/algorithms/reference/module/moduleToRenderNode.ts` — module → render edge.
   - `src/algorithms/reference/module/moduleToModule.ts` — module → module edge.
   - `src/algorithms/reference/module/controlNodeToModule.ts` — control → module edge.

## Verification

- `bun test src/application/GraphView.browser.test.tsx`
- `bun typecheck`
- `bun validate` before opening the PR.
