# Observations — module-render-controls (issue #140)

- No skill in the skills index covers cross-cutting UI/engine plumbing that
  spans `src/graphEngine/*` and `src/ui`. `module-node`'s file scope is
  "write only to src/nodes/module", so it can't do this alone. Handled it as
  an unassigned "orchestrator-direct" task in the plan (documented in
  FEATURE_PLAN.md), then delegated the in-scope module-file wiring to
  `module-node`. Worked fine, but see prompt-improvements note.

- Known limitation, left as-is given the issue frames this as an
  "Experiment": each module's inline toggle checkboxes and the global
  `RenderToggles` panel each keep their own local mirrored `enabled` state
  (matching `RenderToggles`'s existing pattern). If a user toggles the same
  render node from both UIs, the two checkboxes can visually disagree about
  its state (the engine's actual draw/skip state stays correct — this is a
  display sync issue only, and self-corrects when the component next
  re-renders from real toggle info). A proper fix would lift the enabled-set
  to a single owner (e.g. App.tsx) shared by both — out of scope here.

- `.browser.test.tsx` files are excluded from `bun test` (see
  `bunfig.toml`'s `pathIgnorePatterns`) and run only via a separate
  `test:browser` / CI `Browser Tests` workflow that needs Playwright's
  Chromium, which wasn't available in this sandbox. I couldn't run or add
  new interactive-click tests for the new `ModuleRenderToggles` component
  under that harness — testing instead relied on `react-dom/server`'s
  `renderToStaticMarkup` (works fine for markup/checked-state assertions,
  not for verifying click handlers actually fire).
