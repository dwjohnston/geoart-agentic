# Feature Plan: Show graph description on the page

## Skill coverage

None of the skills in the project skills index apply — this is an application-level UI
change (`src/application/AlgorithmPicker.tsx`), not a schema/node/algorithm change.
`node-ideate`, `define-node`, `compute-node`, `render-node`, `control-node`,
`module-node`, and `algorithm` are all specific to the graph-engine node system.

Following the precedent set by the `cloudflare-ssr-shell` feature: implemented directly,
outside the task-file/skill framework. No `task_xx_*.md` files were created.

## Findings

- `GeoArtGraph` (schema `src/schema/schema/schema.json`) already has an optional
  `description` field, and it is already populated on ~12 of the 62 bundled reference
  graphs (e.g. `colorShiftModuleReferenceGraph.ts`, `rotateModuleReferenceGraph.ts`).
- `GraphEntry` / `AlgorithmEntry` (`src/algorithms/index.generated.ts`,
  `src/application/AlgorithmPicker.tsx`) carry the full `graph` object, so
  `current.graph.description` is already available in `AlgorithmPicker` — no new
  plumbing needed through `App.tsx` or the generated index.
- `AlgorithmPicker.tsx` currently renders only the graph's `name` in an `<h2>`. No
  element shows `description` anywhere on the page.

## Tasks (informational, executed directly)

1. Render the current graph's `description` (when present) beneath the `<h2>` name in
   `AlgorithmPicker.tsx`.
2. Add a browser test (`AlgorithmPicker.browser.test.tsx`) covering: description shown
   when present, nothing rendered when absent, and description updates when the
   selected graph changes.
3. Verify: `bun validate` passes.

## Dependency graph

Sequential — single component, test follows implementation.
