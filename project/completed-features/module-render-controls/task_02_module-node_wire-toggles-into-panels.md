# Task 2 — Wire render toggles into module panels

Skill: `module-node`

## Context

Task 1 added a third argument to every module's `inputMarkerNode.renderControl`: `renderToggles: ModuleRenderToggleInfo` (`{ nodes: Array<{ nodeId, renderConfig, enabled }>, onToggle }`). It also added a reusable component `ModuleRenderToggles` at `src/ui/ModuleRenderToggles.tsx` that renders a checkbox list + "toggle all" button for a given `ModuleRenderToggleInfo`. Read `project/features/module-render-controls/handoffs/task_01_infra.md` for the exact shapes.

## Changes

For each of the following module files, update `renderControl` to accept the third `renderToggles` argument and render `<ModuleRenderToggles {...renderToggles} />` inside the existing `<ModulePanel>` (only when `renderToggles.nodes.length > 0`):

- `src/nodes/module/nodes/orbit-module.tsx`
- `src/nodes/module/nodes/reflect-module.tsx`
- `src/nodes/module/nodes/curve-modulator-module.tsx`
- `src/nodes/module/nodes/color-shift-module.tsx`
- `src/nodes/module/nodes/points-on-a-line-v2-module.tsx`
- `src/nodes/module/nodes/linker-module.tsx`
- `src/nodes/module/nodes/rotate-module.tsx`
- `src/nodes/module/nodes/point-render-module.tsx` — currently returns `null` for `renderControl`; change to a `<ModulePanel moduleName="Point Render" moduleId={moduleId}>` wrapping just the toggles (it has no knob controls).

`wave-module.tsx` has no render nodes — leave untouched.

Do not add control nodes to `controlNodes`. This stays entirely within `renderControl` per CLAUDE.md.

## Tests

Extend each module's existing `*.test.tsx` (or add one for point-render-module, which currently has one — check first) with a case that supplies a non-empty `renderToggles` prop and asserts the toggle checkboxes render for that module's render node ids.

## Handoff

Write `project/features/module-render-controls/handoffs/task_02_module-node.md` summarising which modules now show inline render toggles and confirming `RenderToggles.tsx` was not modified (toggle-all panel behaviour preserved).
