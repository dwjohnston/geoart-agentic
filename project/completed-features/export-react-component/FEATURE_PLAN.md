# Feature Plan: Export React component for embedding algorithms elsewhere

## Skill coverage

None of the skills in the project skills index apply — this is an application-level
feature (a reusable public component + an export UI action), not a schema/node/algorithm
change. `node-ideate`, `define-node`, `compute-node`, `render-node`, `control-node`,
`module-node`, and `algorithm` are all specific to the graph-engine node system and none
of them fit "add an embeddable component + an export button".

Following the precedent set by the `cloudflare-ssr-shell` feature (implemented the same
day, same reasoning documented in its `FEATURE_PLAN.md`): implemented directly, outside
the task-file/skill framework. No `task_xx_*.md` files were created for this feature.

## Design

`src/graphEngine/exports/index.ts` is already documented as "the only module permitted to
import from all three node zones" — i.e. it's the intended public API boundary of the
graph engine. The natural embeddable unit is a React component built on top of
`createGraphEngine`, since that's the imperative API the app itself (`App.tsx`) already
drives by hand (canvas refs + `requestAnimationFrame` loop).

Scope, given "export react component" sits alongside "export as image/video/GIF" on the
roadmap (#129) as a user-facing action on a selected algorithm:

1. **`AlgorithmCanvas`** — a new reusable, embeddable React component
   (`src/graphEngine/exports/AlgorithmCanvas.tsx`) that wraps canvas refs +
   `createGraphEngine` + the tick loop behind a `{ graph, size?, speed?, onLoad? }` props
   API, with an imperative handle (`setSpeed`, `toggleRenderNode`) via `forwardRef`. This
   is the component a consumer would actually import to embed an algorithm. Exported from
   `src/graphEngine/exports/index.ts`.

2. **Export UI action** — an "Export" button next to the existing "View graph" button in
   `AlgorithmPicker.tsx`, opening a modal (`ExportAlgorithmModal.tsx`) that shows generated
   `.tsx` source for the selected algorithm and lets the user copy or download it. The
   generator (`src/application/exportReactComponent.ts`) is a pure function so it can be
   unit tested without a browser.

### Known limitation (explicit, not silently glossed over)

The app is a private, unpublished package (`"private": true`, no npm `exports` field), so a
byte-for-byte standalone single file with zero external dependencies isn't achievable
without a bundler pass — the graph engine's registries pull in every compute/render/control
node implementation. The generated file therefore:

- imports `AlgorithmCanvas` from the graph engine's public exports module, and
- carries a header comment stating the consumer needs this repository's graph engine
  source (`src/graphEngine`, `src/nodes`, `src/schema`, `src/common-tooling`,
  `src/domain-helpers`) available as a dependency — e.g. by installing this repo as a git
  dependency, or copying those directories in.

This is scoped as a follow-up (publishing the graph engine as a standalone npm package)
rather than blocking this feature — the issue asks to let a user *export an algorithm as a
component*, which this does; true zero-dependency portability is a packaging concern.

## Tasks (informational, executed directly)

1. Add `AlgorithmCanvas` component + browser test, export from `graphEngine/exports/index.ts`.
2. Add `exportReactComponent.ts` generator (pure function) + unit test.
3. Add `ExportAlgorithmModal.tsx` (copy/download generated source) + wire an "Export" button
   into `AlgorithmPicker.tsx`, following the existing "View graph" modal pattern.
4. Add a browser test exercising the export button + modal.
5. `bun validate`.

## Dependency graph

Sequential — component (1) is needed before the generator can reference it (2), which the
modal (3) renders; tests (4) follow the UI; validate (5) last.
