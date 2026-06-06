# Proposal: Resolving Zone Violations and Naming Drift

## What the 23 warnings actually are

Two distinct categories:

**Production code (5 violations across 2 files)**
- `graphEngine/graphEngine/graphEngine.ts` — imports registries directly even though it already has a DI skeleton (optional `registry` param). Also has a bug: line 110 uses the directly-imported `controlRegistry` rather than the injected one.
- `graphEngine/compiler/validators/_helpers.ts` — `buildNodeMap()` fetches from registries it imports directly instead of accepting them as a parameter.

**Test files (18 violations across 4 files)**
All four test files (compiler, evaluator, graphEngineBehaviour, algorithms/graphs) do the same thing: import from all three node registries to build a `realNodeRegistry` fixture, then pass it to `compile()` or `createGraphEngine()`. These violations are structural — tests are the composition layer; they legitimately need to wire real implementations together to exercise the engine.

---

## Proposed structure

### 1. Add `src/graphEngine/exports/` — the single public entry point

A new module that re-exports the public API of the graph engine. This is the **only** zone allowed to import from node zones (`nodesCompute`, `nodesRender`, `nodesControl`). It wires registries once and re-exports everything callers need:

```ts
// src/graphEngine/exports/index.ts
export { compile } from '../compiler/compiler';
export { validate } from '...';
export { tick as evaluate } from '../evaluator/evaluator';
export { createGraphEngine } from '../graphEngine/graphEngine';  // re-exported as-is
export { implementComputeNode, implementRenderNode, implementControlNode }; // for test mocking
```

`App.tsx` changes only its import path — `createGraphEngine` name and call signature stay identical. Tests that need to mock node implementations import `implementRenderNode` etc. from here rather than from the node zones directly.

### 2. Zone rules

Add a `graphEngineExports` zone to `eslint.config.ts` covering `src/graphEngine/exports/`:
- Allowed to import from: `compiler`, `evaluator`, `graphEngine`, `nodesCompute`, `nodesRender`, `nodesControl`, `theSchema`, `common-tooling`
- `application` changes its allowed list to import from `graphEngineExports` instead of `graphEngine` internals
- Test files get a `files: ['**/*.test.ts']` override that allows importing from `graphEngineExports`

### 3. Production code — complete the DI

Remove the direct registry imports from `graphEngine.ts` and `_helpers.ts`. The registries flow in from `exports/` rather than being imported at each use site:

- `_helpers.ts`: `buildNodeMap(algorithm, registry)` — accept registry as a parameter
- `graphEngine.ts`: remove fallback imports; fix line-110 bug (uses `controlRegistry` directly instead of injected one)

### 4. Naming — align with code audit (B1 + B2)

The `externalInterfaces/` files and node exports use "Definition" vocabulary (`*NodeDef`, `ComputeNodeDefinition.ts`, `convertComputeNodeDefinitionToLegacyDefinition`) for what are implementation contracts. These should be `*NodeImplementation`.

Blast radius:
- `externalInterfaces/` filenames and all types within
- All node exports (`timeNodeDef` → `timeNodeImplementation`, etc.)
- The `convert*` helper functions
- Registry call sites

`addNodeImplementation` in `add.node.ts` already follows the correct convention and is the template.

### Future state

The `exports/` module is the natural home for `constructEngineFromSchema(schema)`. Once that exists, the current re-exports become the hardcoded-schema default, and arbitrary schemas can be supported by passing a different schema to the factory.

### What this does NOT include

- `GeoArtGraph` → `GeoArtAlgorithm` (B3 from code-audit.md) — highest-impact naming decision, conflicts with `algorithm_lifecycle.md`, needs a separate explicit sign-off before any sweep.
- Remaining audit items (B4–B7, A1–A4) — cosmetic and lower-risk, can follow once structural work is done.

---

## Order of operations

1. Add `src/graphEngine/exports/index.ts` with re-exports
2. Update zone rules in `eslint.config.ts`
3. Fix DI in `_helpers.ts` + `graphEngine.ts` (fixes 5 production violations)
4. Update import paths in `App.tsx` and all four test files (fixes 18 test violations)
5. Naming sweep: `*NodeDef` → `*NodeImplementation` everywhere (B1 + B2 from code-audit.md)
6. Verify with `bun validate` — zero warnings

Steps 1–4 are small and safe. Step 5 is mechanical but wide; best done as a single focused pass.
