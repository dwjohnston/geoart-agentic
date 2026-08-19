# Feature Plan: Render module nodes in the graph view

## Investigation summary

- `src/application/GraphView.tsx` builds its layout and connection list purely from
  `graph.control.nodes`, `graph.compute.nodes` and `graph.render.nodes`. `graph.module.nodes`
  (top-level, unexpanded module nodes such as `orbit-module`) is never read.
- Module node input/output port metadata already exists in the generated files
  `src/schema/_generated/node-inputs-2.ts` and `node-outputs-2.ts` for every module kind
  (`orbit-module`, `wave-module`, `point-render-module`, `curve-modulator-module`,
  `linker-module`, `color-shift-module`, `reflect-module`, `rotate-module`,
  `points-on-a-line-v2-module`) — `getInputPorts`/`getOutputPorts` in `GraphView.tsx` will
  work for module kinds unmodified.
- `graphViewRegistry.ts` falls back to `DefaultNodeBody` for any kind it doesn't recognise, so
  module nodes render with a generic body (ports + static/ref values) without further changes.
  `moduleRegistry` entries are implementation functions, not simple `{nodeKind, defaultValues,
  renderRepresentation}` records, so wiring them into `graphViewRegistry` for default-value
  display and a bespoke body is out of scope for this issue (module nodes already show
  connected/unconnected ports correctly without it).
- Existing reference graphs already exercise every module wiring case and can be reused as test
  fixtures instead of writing new ones: `src/algorithms/reference/module/singleModule.ts`
  (control/compute → module), `moduleToRenderNode.ts` (module → render), `moduleToModule.ts`
  (module → module), `controlNodeToModule.ts` (control → module).

## Task

This is application-layer UI work on an existing component (`GraphView.tsx`, `NodeCard.tsx`) —
it does not touch the schema or add a node type, so none of the node-lifecycle skills
(`define-node`, `compute-node`, `render-node`, `control-node`, `module-node`, `algorithm`)
apply. It is executed directly in Phase 3 rather than via a named skill.

1. `task_01_direct_render-module-nodes-in-graph-view.md` — add a "Module" column to
   `GraphView.tsx`, include `graph.module.nodes` in connection/layout computation, add a
   `module` layer kind to `NodeCard.tsx`, and add regression tests using the existing module
   reference graphs.

## Dependency graph

```
task_01 (only task, no dependencies)
```
