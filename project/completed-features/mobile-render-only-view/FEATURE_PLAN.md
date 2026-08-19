# Feature Plan: Mobile support — first pass: render-only view

## Skill coverage

None of the skills in the project skills index apply — this is a UI/layout change to `App.tsx` and `Canvas.tsx`, not a schema/node/algorithm change. `node-ideate`, `define-node`, `compute-node`, `render-node`, `control-node`, `module-node`, and `algorithm` are all specific to the graph-engine node system.

Per precedent set by `cloudflare-ssr-shell`: implemented directly, outside the task-file/skill framework. No `task_xx_*.md` files created.

## Tasks (informational, executed directly)

1. Add a `useIsMobile` hook (matchMedia-based, breakpoint 768px) to detect a mobile viewport.
2. In `App.tsx`, branch the layout: on mobile, render only the `Canvas` (no `SidePanel`s, no `Controls`, no `AlgorithmPicker`/`SpeedControl`/`RenderToggles`, no import modal — the builder (`GraphView`) is only reachable from `AlgorithmPicker`, so it's excluded transitively).
3. Make `Canvas` responsive (`maxWidth: 100%`, CSS-scaled canvas elements over the fixed 800x800 draw resolution) so it fits the viewport on narrow screens instead of overflowing.
4. Add/extend browser tests covering the mobile branch (side panel/controls absent, canvas present) and confirming the desktop branch is unaffected.
5. Verify: `bun validate`.

## Dependency graph

Sequential — each step builds on the prior one (hook -> layout branch -> responsive canvas -> tests -> verify).
