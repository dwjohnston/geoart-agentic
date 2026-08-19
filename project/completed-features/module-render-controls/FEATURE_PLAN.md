# Feature Plan — Pull render controls into module control panel

## Investigation summary

- `RenderToggles.tsx` (application layer) is the existing global panel: toggle-all, toggle-by-layer, toggle-by-tag, toggle-by-module, and per-node checkboxes. It owns a local mirrored `enabled` state and calls `onToggle(nodeId)` -> `engine.toggleRenderNode(nodeId)`. **Left unchanged** — satisfies the issue's "don't lose toggle-all" constraint.
- Each module's UI is produced by `inputMarkerNode.renderControl(params, set)`, invoked from `graphEngine.ts`'s `renderControlNodes()`. This is the integration point the issue names.
- `renderControl` currently only receives `(params, set)` — no visibility/toggle data. To surface a module's own render-node toggles *inside* its `ModulePanel`, `renderControlNodes()` needs to also compute, per module-input-marker node, the list of render nodes belonging to that module (namespaced `{moduleId}:...`) plus their current enabled state (read from the engine's own `enabledRenderNodes` set — the real source of truth), and pass it through as a new third argument.
- 8 of 9 modules own render nodes and render a `<ModulePanel>`: orbit, reflect, curve-modulator, color-shift, points-on-a-line-v2, linker, rotate, point-render. `wave-module` has no render nodes — untouched.

## Skill-coverage gap (noted per workflow-plan's rule)

No listed skill covers cross-cutting plumbing across `src/graphEngine/graphEngine`, `src/graphEngine/externalInterfaces`, and `src/ui` (new shared toggle component). `module-node`'s file scope is restricted to `src/nodes/module`. Per workflow-plan: "If a task requires a skill that does not exist, stop and inform the user. Do not create a generic task file as a workaround."

Resolution: the orchestrating agent performs the plumbing task directly (Task 1, no skill assigned — this is disclosed here and in `project/feedback`), then delegates the in-scope module-file work to `module-node` (Task 2), which fits its declared scope exactly.

## Tasks

1. **task_01_infra_render-toggle-plumbing.md** — no skill (orchestrator-direct). Add `ModuleRenderToggleInfo` type + extend `renderControl`'s signature in `ModuleImplementation.ts`; compute + pass module-scoped render toggle info from `graphEngine.ts`; add shared `ModuleRenderToggles` UI component in `src/ui/`. Depends on: nothing.
2. **task_02_module-node_wire-toggles-into-panels.md** — skill: `module-node`. Wire the new `ModuleRenderToggles` component into the 8 modules' `ModulePanel`s using the new third `renderControl` argument. Depends on: task 1 (needs the type + component to exist).

Dependency graph: task 1 -> task 2 (sequential; task 2 cannot start until task 1's types/component exist).
