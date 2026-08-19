# Task 1 — Render toggle plumbing (infra, no skill)

No skill in the skills index covers this cross-cutting change (touches `src/graphEngine/graphEngine`, `src/graphEngine/externalInterfaces`, `src/ui`). Performed directly by the orchestrating agent.

## Changes

1. `src/graphEngine/externalInterfaces/ModuleImplementation.ts`
   - Add `ModuleRenderToggleInfo` type: `{ nodes: Array<{ nodeId: string; renderConfig: RenderLayerConfig; enabled: boolean }>; onToggle: (nodeId: string) => void }`.
   - Extend `inputMarkerNode.renderControl` signature to `(params, set, renderToggles: ModuleRenderToggleInfo) => React.ReactNode`. Existing 2-arg module implementations remain valid (TS allows fewer-param function assignment).

2. `src/graphEngine/graphEngine/graphEngine.ts`
   - In `renderControlNodes()`, when handling a `module-input-marker` node, derive `moduleId` from `nodeId.split(':')[0]`, filter the closure's `renderingNodes` array for entries whose `nodeId` starts with `${moduleId}:`, map each to `{ nodeId, renderConfig, enabled: enabledRenderNodes.has(nodeId) }`, and pass `{ nodes, onToggle: toggleRenderNode }` as the third argument to `moduleInputMarkerRenderControl`.

3. `src/ui/ModuleRenderToggles.tsx` (new)
   - Small reusable component taking `ModuleRenderToggleInfo` as props.
   - Renders one checkbox per render node (label = node id with the `{moduleId}:` prefix stripped) plus a single "toggle all" button scoped to just these nodes.
   - Mirrors the existing local-state pattern already used in `RenderToggles.tsx` (local `useState<Set<string>>` seeded from the `enabled` prop, updated on click, calling `onToggle(nodeId)`).

## Tests

- `src/ui/ModuleRenderToggles.test.tsx` — renders with a fixture list of nodes, asserts checkboxes render with correct checked state and that clicking calls `onToggle` with the right node id; toggle-all button flips all nodes.
- Extend `src/graphEngine/graphEngine/graphEngineBehaviour.test.ts` (or add a new test file) — verify that for a graph containing a module, `renderControlNodes()` forwards the module's own render nodes (and only those) with correct `enabled` values matching `enabledRenderNodes`, and that calling the forwarded `onToggle` actually flips the engine's real toggle state (checked via a subsequent `tick()`).

## Handoff

Write `project/features/module-render-controls/handoffs/task_01_infra.md` describing the new `ModuleRenderToggleInfo` type shape, the new `renderControl` signature, and how to import/use `ModuleRenderToggles` from `src/ui/ModuleRenderToggles.tsx`.
