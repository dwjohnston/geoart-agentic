# Feature Brief: The Laboratory

## Overview

The Laboratory is a standalone TypeScript/Bun experimentation framework that uses an LLM to iteratively generate and refine generative art algorithms. It lives at `/laboratory/` from the project root (outside `src/`).

The core loop is:
1. Send the LLM a JSON schema of available nodes and a prompt
2. LLM returns a JSON algorithm declaration
3. Validate the declaration against the schema
4. Compile and render it to an image using the graph engine
5. Feed the image back to the LLM as feedback, repeat

---

## Location and Module Rules

- Lives at `/laboratory/` from the project root
- No `@/` path aliases — relative imports only
- Entry point: `laboratory/index.ts`, runnable with `bun laboratory/index.ts`

---

## Dependencies

Install: `ai`, `@ai-sdk/anthropic`, `@ai-sdk/openai`

Already present: `@napi-rs/canvas`, `ajv`

---

## Core Types

```ts
type ModelId = 'anthropic/claude-sonnet-4-6' | 'openai/gpt-4o' | (string & {})
// Provider prefix is part of the ID — no mapping needed

type Ingredient = {
  schema: object          // the unified node schema
  basePrompt: string      // initial generation prompt
  feedbackPrompt: string  // refinement prompt shown with image
}

type ExperimentVariable<T> = T | T[]
// If an array, each value produces a separate run

type ExperimentConfig = {
  name: string
  model: ExperimentVariable<ModelId>
  numIterations: ExperimentVariable<number>
  renderTicks?: number    // defaults to 1
  ingredients: Ingredient
}

type ExperimentResult = {
  resultName: string      // derived from experiment name + variable values
  iterations: IterationRecord[]
}

type IterationRecord = {
  iterationIndex: number
  prompt: string
  algorithmJson: unknown
  imageBuffer: Buffer
}
```

---

## Key Functions

### `renderToImage(json: unknown, ticks?: number): Promise<Buffer>`
- `ticks` defaults to 1
- Canvas size: fixed 400x400
- Uses the graph engine (`src/graphEngine/compiler/` and `src/graphEngine/evaluator/`) to compile and evaluate the algorithm
- Uses `@napi-rs/canvas` to render
- Throws descriptively on compile or evaluation failure

### `validateSchema(json: unknown, schema: object): boolean`
- Uses `ajv`
- Returns true if valid, throws with validation errors if not

### `conductExperiment(config: ExperimentConfig): Promise<ExperimentResult[]>`
- Expands all `ExperimentVariable` arrays into the full cross-product of runs
- Each unique combination of variable values is a separate run
- `resultName` is derived from the experiment name plus the variable values that differ across runs
- Each iteration is wrapped in try/catch with the iteration number attached to the error

### `singleTest(config: Omit<ExperimentConfig, 'name'>): Promise<ExperimentResult>`
- Convenience wrapper for a single non-variadic run

---

## Variable Expansion and resultName

`ExperimentVariable<T>` fields — `model`, `numIterations` (and potentially others in future) — can each be a single value or an array.

All combinations are expanded into separate runs. Example:

```ts
model: ['anthropic/claude-sonnet-4-6', 'openai/gpt-4o'],
numIterations: [3, 5]
// → 4 runs: sonnet/3, sonnet/5, gpt4o/3, gpt4o/5
```

`resultName` encodes the differing variables, e.g. `"my-experiment__anthropic-claude-sonnet-4-6__3"`.

---

## File Output

Results are written to `/laboratory/results/[resultName]/`:
- `iteration_00.png`, `iteration_01.png`, etc.
- `iterations.json` — full `IterationRecord[]` for the run

All file I/O uses Bun-native APIs. Directory creation uses `mkdir` from `node:fs/promises` with `{ recursive: true }`.

---

## Registry

A node registry is built from the schema at startup. Throws with a descriptive error including the missing ID and the resolved path if a node type is not found.

---

## Seed Ingredients

A minimal set of starter ingredients ships with the feature so the lab is runnable immediately:

- `laboratory/ingredients/schema.ts` — copies/adapts from `src/schema/schema/schema-unified.generated.json`
- `laboratory/ingredients/basePrompt.ts` — initial generation prompt
- `laboratory/ingredients/feedbackPrompt.ts` — refinement prompt

---

## Entry Point

`laboratory/index.ts` calls `conductExperiment` or `singleTest` with a hardcoded or config-driven experiment using the seed ingredients. Running `bun laboratory/index.ts` should produce output in `/laboratory/results/`.

---

## Error Handling

- Each iteration wrapped in try/catch; thrown errors include the iteration index
- Registry throws with missing node ID and resolved path
- `renderToImage` throws descriptively on compile/eval failure
- `validateSchema` throws with AJV validation messages on failure
