# Pull render controls into module control panel

(GitHub issue #140)

## Summary
Experiment with surfacing each render node's visibility toggle inside its owning module's control panel, instead of (or alongside) the separate `RenderToggles` panel.

## Constraint
Still need a way to toggle **all** render nodes of a given type/layer at once — don't lose the existing "toggle all" behavior in `RenderToggles.tsx` when doing this.

## Notes
- Modules already expose a `renderControl` hook (`src/nodes/module/moduleUtils.ts`) used for custom per-module UI — likely the integration point.

Part of the UX polish pass (see project/offline_instructions.md).
