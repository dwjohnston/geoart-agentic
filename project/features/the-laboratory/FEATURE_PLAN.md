# Feature Plan: The Laboratory

## Status

| Task | Agent | Status |
|------|-------|--------|
| task_01_tooling_dependencies | tooling-agent | pending |
| task_02_laboratory_scaffold | laboratory-agent | pending |
| task_03a_validate_schema | laboratory-agent | pending |
| task_03b_render_to_image | laboratory-agent | pending |
| task_03c_conduct_experiment | laboratory-agent | pending |
| task_03d_seed_ingredients | laboratory-agent | pending |
| task_04_single_test | laboratory-agent | pending |
| task_05_entry_point | laboratory-agent | pending |

---

## Dependency Graph

```
task_01_tooling_dependencies
        |
        v
task_02_laboratory_scaffold
        |
        +----------------------------------+----------------------------------+
        |                |                 |                                  |
        v                v                 v                                  v
task_03a_validate  task_03b_render   task_03c_conduct              task_03d_seed_ingredients
   _schema           _to_image          _experiment
        |                |
        +----------------+
                |
                v
        task_04_single_test
                |
                +------------------------------+
                |                              |
                v                              v
      task_03c_conduct_experiment    task_03d_seed_ingredients
                |                              |
                +------------------------------+
                           |
                           v
                  task_05_entry_point
```

Simplified:
- task_01 → task_02
- task_02 → task_03a, task_03b, task_03c, task_03d (all parallel)
- task_03a + task_03b → task_04
- task_03c + task_03d + task_04 → task_05

---

## task_01_tooling_agent_dependencies

**Agent:** tooling-agent

Install required packages and register the bun run script.

- Add to `package.json` dependencies: `ai`, `@ai-sdk/anthropic`, `@ai-sdk/openai`
- Run `bun install`
- Add script entry: `"laboratory": "bun laboratory/index.ts"`

`@napi-rs/canvas` and `ajv` are already present — do not re-add them.

---

## task_02_laboratory_agent_scaffold

**Agent:** laboratory-agent

Create the foundation that unblocks all parallel tasks. Do not implement logic — only types and stubs.

**Deliverables:**

`laboratory/types.ts` — define all core types:
- `ModelId`, `Ingredient`, `ExperimentVariable<T>`, `ExperimentConfig`, `ExperimentResult`, `IterationRecord`

See the feature brief at `/Users/davidjohnston/claude-workspace/geoart/app/project/features/the-laboratory/FEATURE_BRIEF.md` for exact type shapes.

`laboratory/validateSchema.ts` — export `validateSchema(json: unknown): boolean` with `throw new Error('not implemented')` body.

`laboratory/renderToImage.ts` — export `renderToImage(json: unknown, ticks?: number): Promise<Buffer>` with `throw new Error('not implemented')` body.

`laboratory/conductExperiment.ts` — export `conductExperiment(config: ExperimentConfig): Promise<ExperimentResult[]>` and `singleTest(config: Omit<ExperimentConfig, 'name'>): Promise<ExperimentResult>`, both with `throw new Error('not implemented')` bodies.

Run `bun typecheck` and fix any type errors before finishing.

---

## task_03a_laboratory_agent_validate_schema

**Agent:** laboratory-agent

Implement `validateSchema` in `laboratory/validateSchema.ts`.

- Import and call `validateGeoArtGraph` from `src/schema/validateGeoArtGraph.ts` — it validates an algorithm JSON against the GeoArt schema using Ajv2019.
- Return `true` if valid; re-throw with validation messages if not.
- Do not set up Ajv from scratch.

Depends on: task_02

---

## task_03b_laboratory_agent_render_to_image

**Agent:** laboratory-agent

Implement `renderToImage` in `laboratory/renderToImage.ts`.

`renderToImage(json: unknown, ticks?: number): Promise<Buffer>` — defaults `ticks` to 1.

Pattern to follow: `src/graphEngine/graphEngine/renderSnapshotToFile.ts` — compile graph → evaluate using a recording context to capture canvas calls → replay via `replayCallsOnCanvas` from `src/common-tooling/test-tooling/replayContext.ts` at 400×400 → return PNG buffer.

Key references:
- `replayCallsOnCanvas(calls, width, height): Canvas` — replays recorded canvas calls onto an `@napi-rs/canvas` Canvas
- `renderSnapshotToFile` — use as the reference pattern, do not copy it verbatim

Throw descriptively on compile or evaluation failure.

Depends on: task_02

---

## task_03c_laboratory_agent_conduct_experiment

**Agent:** laboratory-agent

Implement `conductExperiment` in `laboratory/conductExperiment.ts`. The `singleTest` stub is already present from task_02 — you can call it knowing its interface without needing its implementation to be complete.

- Expand `model` and `numIterations` `ExperimentVariable` arrays into the full cross-product of runs
- `resultName` encodes the differing variables, e.g. `"my-experiment__anthropic-claude-sonnet-4-6__3"`
- Each run: prompt LLM → validate → render → feed image back, iterating for `numIterations`
- Wrap each iteration in try/catch with the iteration index attached to the error
- Write results to `/laboratory/results/[resultName]/`:
  - `iteration_00.png`, `iteration_01.png`, etc.
  - `iterations.json` — the full `IterationRecord[]`
- Use Bun-native file APIs and `mkdir` from `node:fs/promises` with `{ recursive: true }`
- Use the `ai` SDK with `@ai-sdk/anthropic` and `@ai-sdk/openai`. Parse the provider prefix from `ModelId` (`anthropic/` → Anthropic, `openai/` → OpenAI).

Depends on: task_02

---

## task_03d_laboratory_agent_seed_ingredients

**Agent:** laboratory-agent

Create seed ingredient files in `laboratory/ingredients/`.

`laboratory/ingredients/schema.ts` — read `src/schema/schema/schema-unified.generated.json` and re-export it. If the file does not exist, export a placeholder `{}` with a TODO comment.

`laboratory/ingredients/basePrompt.ts` — export `basePrompt: string`: a concise system-style prompt instructing the LLM to return a valid JSON algorithm declaration using the provided schema.

`laboratory/ingredients/feedbackPrompt.ts` — export `feedbackPrompt: string`: a concise prompt accompanying the rendered image, asking the LLM to refine the algorithm.

Depends on: task_02

---

## task_04_laboratory_agent_single_test

**Agent:** laboratory-agent

Implement `singleTest` in `laboratory/conductExperiment.ts`.

`singleTest(config: Omit<ExperimentConfig, 'name'>): Promise<ExperimentResult>` — convenience wrapper that calls `conductExperiment` with name `"single-test"` and returns the first result.

This task requires `validateSchema` (task_03a) and `renderToImage` (task_03b) to be complete, as `singleTest` drives the validate → render pipeline directly.

Depends on: task_03a, task_03b

---

## task_05_laboratory_agent_entry_point

**Agent:** laboratory-agent

Create `laboratory/index.ts`.

- Import `singleTest` (or `conductExperiment`) and the seed ingredients from `laboratory/ingredients/`
- Run a hardcoded minimal experiment using the seed ingredients
- Running `bun laboratory/index.ts` should produce output in `/laboratory/results/`

Run `bun typecheck` after implementing and fix any type errors.

Depends on: task_03c, task_03d, task_04
