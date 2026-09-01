# Handoff — task 2 (wire toggles into module panels)

## Modules updated

All 8 modules that own render nodes now show `<ModuleRenderToggles {...renderToggles} />` inside their existing `<ModulePanel>` (only rendered when `renderToggles.nodes.length > 0`):

- `orbit-module.tsx`, `reflect-module.tsx`, `curve-modulator-module.tsx`, `color-shift-module.tsx`, `points-on-a-line-v2-module.tsx`, `linker-module.tsx`, `rotate-module.tsx` — toggles added alongside their existing knob/dropdown controls.
- `point-render-module.tsx` — previously returned `null` from `renderControl`; now returns a `<ModulePanel moduleName="Point Render">` wrapping just the toggles (it has no other controls).

`wave-module.tsx` has no render nodes (`renderNodes: []`) — left untouched, per the plan.

## Nested modules

`curve-modulator-module` nests `point-render-module` (via its own `moduleNodes` array). Each gets its own separate control-panel entry and its own scoped toggle list (fixed in task 1's `graphEngine.ts` moduleId derivation — see that handoff). Verified in `src/graphEngine/graphEngine/moduleRenderToggles.test.ts`.

## `RenderToggles.tsx` — not modified

The global toggle-all panel (`src/application/RenderToggles.tsx`) is untouched — its toggle-all / per-layer / per-tag / per-module behaviour is preserved exactly as before, per the issue's constraint. The new module-scoped toggles are an addition, not a replacement.

## No control nodes added

Every module's `controlNodes: []` is unchanged. All new UI goes through `renderControl` + `renderIfNeeded` (existing helpers) + the new `ModuleRenderToggles` component, per CLAUDE.md.

## Tests

Added a render-toggle test to each module's test file (`renderToStaticMarkup` on `inputMarkerNode.renderControl(params, set, renderToggles)`, asserting checkbox markup + node id label appear). Added `orbit-module.test.tsx` (didn't previously exist) with the same coverage. `point-render-module.test.tsx` also covers the `renderToggles.nodes.length === 0` case (returns `null`).
