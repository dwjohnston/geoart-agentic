# Plan: Add Output Types to Schema

Feature brief: `project/staging/add-output-types-to-schema.md`

## Status

| Task | Agent | Status |
|------|-------|--------|
| A — value-kinds.schema.json | schema-agent | pending |
| B — refable-value-kinds.schema.json | schema-agent | pending |
| C — update schema.json | schema-agent | pending |
| D — generator script | schema-agent | pending |
| E — extend validateSchemaStructure | schema-agent | pending |
| F — wire generator into build | tooling-agent | pending |
| G1 — update src/graph | graph-agent | pending |
| G2 — update src/nodes/control | control-node-agent | pending |
| G3 — update src/nodes/compute | compute-node-agent | pending |
| G4 — update render nodes | render-node-agent | pending |
| H — evaluate narrowing on ControlNodeDef | control-node-agent | pending |

## Dependency Graph

```
A → B → C ─┬→ D ─┐
            └→ E ─┴→ F, G1, G2, G3, G4 → H
```

D and E run in parallel after C. F, G1–G4 run in parallel after D and E. H runs last.

---

## Task A

Create `src/schema/value-kinds.schema.json`. See Step 1 of the feature brief.

## Task B

Create `src/schema/refable-value-kinds.schema.json`. See Step 2 of the feature brief.

## Task C

Update `src/schema/schema.json`: slim down (Step 3) and add `x-outputs` to all node definitions (Step 4) in one pass.

## Task D

Create `src/schema/scripts/generate-node-outputs.ts`. Emits `src/schema/_generated/value-types.ts` and `src/schema/_generated/node-outputs.ts`. See Step 5 of the feature brief.

## Task E

Extend `src/schema/validateSchemaStructure.ts` to accept a `SchemaSet` map and enforce the new cross-file rules. Update tests and call sites. See Step 6 of the feature brief.

## Task F

Update the `generate:schema-types` script in `package.json` to also run `src/schema/scripts/generate-node-outputs.ts`. See Step 7 of the feature brief.

## Task G1

In `src/graph/`: delete `types.ts`, update compiler/evaluator to read `outputs[i].valueType`. See Step 8 of the feature brief.

## Task G2

In `src/nodes/control/`: replace manual `outputs` arrays with `nodeOutputs[type]`, update `Value` imports to `_generated/value-types.ts`. See Step 8 of the feature brief.

## Task G3

In `src/nodes/compute/`: same changes as G2. See Step 8 of the feature brief.

## Task G4

In `src/render/`: same changes as G2 for the render layer. See Step 8 of the feature brief.

## Task H

In `src/nodes/control/`: add `KindToValue` map type and `EvaluateReturn<T>`, update `ControlNodeDef<T>` evaluate signature. See Step 9 of the feature brief.
