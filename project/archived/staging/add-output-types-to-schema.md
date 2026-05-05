# Add Output Types to Schema

## Problem

Output ports for every node type are declared manually in TypeScript node def files (`outputs: PortDef[]`). The JSON schema has no knowledge of outputs — it only describes inputs (params). This creates two problems:

1. **Duplication.** The same information exists in the schema (what a node accepts) and the node def (what it emits), with no cross-check between them.

2. **Type narrowing is blocked.** `ControlNodeDef<T>` can narrow `renderControl`'s `node` parameter by `T`, but `evaluate`'s return type is stuck at `Value[]` because the type system has no compile-time knowledge of which `Value` variants a given node type actually emits.

## Solution

### Step 1 — Create `value-kinds.schema.json`

The single source of truth for what a value looks like at runtime. `colorValue` and `pointValue` already exist in `schema.json` as raw-shape definitions — move them here. Add the missing primitives.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "GeoArt Value Kinds",
  "definitions": {
    "numberValue":         { "title": "Number Value", "type": "number" },
    "stringValue":         { "title": "String Value", "type": "string" },
    "colorValue":          { "title": "Color Value",  "type": "object", "additionalProperties": false,
                             "properties": { "r": ..., "g": ..., "b": ..., "a": ... } },
    "pointValue":          { "title": "Point Value",  "type": "object", "additionalProperties": false,
                             "properties": { "x": ..., "y": ... } },
    "colorPointValue":     { ... },
    "colorPointArrayValue":{ ... }
  }
}
```

### Step 2 — Create `refable-value-kinds.schema.json`

The param-level versions of each value kind — `oneOf [static value, ref]`. Currently these live scattered through `schema.json` as `numberParam`, `colorParam`, etc. Extract them here as a cohesive set. Each references `value-kinds.schema.json` for the static branch's value shape.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "GeoArt Refable Value Kinds",
  "definitions": {
    "numberValueOrRef": {
      "title": "Number Value Or Ref",
      "oneOf": [
        { "type": "object", "additionalProperties": false, "required": ["v"],
          "properties": { "v": { "$ref": "value-kinds.schema.json#/definitions/numberValue" },
                          "locked": ..., "comment": ... } },
        { "$ref": "schema.json#/definitions/refParam" }
      ]
    },
    "colorValueOrRef": {
      "title": "Color Value Or Ref",
      "oneOf": [
        { "type": "object", "additionalProperties": false, "required": ["v"],
          "properties": { "v": { "$ref": "value-kinds.schema.json#/definitions/colorValue" },
                          "locked": ..., "comment": ... } },
        { "$ref": "schema.json#/definitions/refParam" }
      ]
    },
    "pointValueOrRef":  { ... },
    "stringValueOrRef": { ... }
  }
}
```

Node `params` in `schema.json` then reference `refable-value-kinds.schema.json` rather than inline definitions.

### Step 3 — Slim down `schema.json`

- Remove `colorValue`, `pointValue`, `colorPointValue`, `colorPointArrayValue` — moved to `value-kinds.schema.json`
- Remove `numberParam`, `colorParam`, `pointParam`, `stringParam` etc. — moved to `refable-value-kinds.schema.json`
- Update all `$ref`s accordingly
- `schema.json` now owns only: graph structure, `refParam`, `lockedProp`, `commentProp`, and node definitions

### Step 4 — Add `x-outputs` to every node definition in `schema.json`

`x-outputs` is a schema-level extension keyword — a sibling of `properties`, not inside it. JSON Schema validators ignore unknown keywords; `additionalProperties: false` applies to graph *instances*, not to the schema definition object itself.

Convention: `valueType` is a string key matching a definition name in `value-kinds.schema.json`.

```json
{
  "title": "Slider Control Node",
  "type": "object",
  "additionalProperties": false,
  "x-outputs": [
    { "name": "value", "valueType": "numberValue" }
  ],
  "required": ["id", "type", "params"],
  "properties": { ... }
}
```

Multi-output example (LFO):
```json
"x-outputs": [
  { "name": "baseValue", "valueType": "numberValue" },
  { "name": "frequency", "valueType": "numberValue" },
  { "name": "amplitude", "valueType": "numberValue" },
  { "name": "waveShape", "valueType": "stringValue" }
]
```

Nodes with no outputs (pure render sinks) get `"x-outputs": []`.

### Step 5 — Write a custom generator script

`json-schema-to-typescript` does not process `x-outputs`. A new script (alongside `scripts/generate-openapi.ts`) reads `value-kinds.schema.json` and `schema.json` and emits two generated files:

**`src/schema/_generated/value-types.ts`** — replaces `src/graph/types.ts`:
```typescript
// generated — do not edit
export type NumberValue = { kind: 'number'; v: number };
export type ColorValue  = { kind: 'color';  v: { r: number; g: number; b: number; a: number } };
export type StringValue = { kind: 'string'; v: string };
export type PointValue  = { kind: 'point';  v: { x: number; y: number } };
// ...
export type Value = NumberValue | ColorValue | StringValue | PointValue | ...;
```

The generator maps each `value-kinds.schema.json` definition to its TypeScript shape, adding the `kind` discriminator. This mapping (definition name → `kind` string) is the one thing that cannot itself come from JSON Schema and lives in the generator script.

**`src/schema/_generated/node-outputs.ts`** — replaces manual `PortDef[]` arrays in node defs:
```typescript
// generated — do not edit
export const nodeOutputs = {
  slider:      [{ name: 'value', valueType: 'numberValue' }],
  colorPicker: [{ name: 'value', valueType: 'colorValue'  }],
  dropdown:    [{ name: 'value', valueType: 'stringValue' }],
  time:        [{ name: 'time',  valueType: 'numberValue' }],
  // ... all node types across all layers
} as const;
```

### Step 6 — Extend `validateSchemaStructure`

`src/schema/validateSchemaStructure.ts` currently validates node title conventions. Extend it to follow cross-file `$ref`s and enforce the rules below.

**Signature** — the function accepts a map of filename → parsed schema. It resolves `$ref`s (e.g. `"value-kinds.schema.json#/definitions/colorValue"`) by splitting on `#`, looking up the filename key, then navigating the JSON pointer. Pure, no filesystem access, fully testable with inline objects.

```typescript
type SchemaSet = Record<string, unknown>; // filename → parsed JSON

export function validateSchemaStructure(schemas: SchemaSet): SchemaValidationResult
```

Called as:
```typescript
validateSchemaStructure({
  'schema.json': mainSchema,
  'value-kinds.schema.json': valueKinds,
  'refable-value-kinds.schema.json': refableValueKinds,
})
```

**Rules enforced:**

Naming conventions (checked against the auxiliary schema files):
- Every definition name in `value-kinds.schema.json` must end with `Value`
- Every definition name in `refable-value-kinds.schema.json` must end with `ValueOrRef`

`x-outputs` completeness (checked against `schema.json`):
- Every node in every `oneOf` array (control, compute, render) must have an `x-outputs` array
- Every `x-outputs` entry's `valueType` must match a definition key in `value-kinds.schema.json`

Param origin by layer (checked by following `$ref`s from node `params.properties`):
- Every `$ref` inside a control node's `params.properties` must resolve into `value-kinds.schema.json`
- Every `$ref` inside a compute or render node's `params.properties` must resolve into `refable-value-kinds.schema.json`

Update the corresponding test file and any call site that invokes `validateSchemaStructure`.

### Step 7 — Wire the generator into `generate:schema-types`

Run the new script as part of the same step so all generated files stay in sync.

### Step 8 — Update consuming code

- Each node def replaces its manual `outputs` array with `outputs: nodeOutputs['slider']`
- Delete `src/graph/types.ts`; all imports of `Value`, `NumberValue`, etc. point to `_generated/value-types.ts`
- The compiler and validator read `outputs[i].valueType` instead of `outputs[i].type`

### Step 9 — Enable `evaluate` narrowing on `ControlNodeDef`

With `nodeOutputs as const` and a `KindToValue` map derived from the generated types:

```typescript
type KindToValue = {
  numberValue: NumberValue;
  colorValue:  ColorValue;
  stringValue: StringValue;
  pointValue:  PointValue;
};

type EvaluateReturn<T extends ControlNode['type']> =
  KindToValue[(typeof nodeOutputs)[T][number]['valueType']];
```

`ControlNodeDef<'slider'>` gets `evaluate(): NumberValue[]` — no second generic, no manual annotation.

## End State

```
src/schema/
  value-kinds.schema.json          ← raw value shapes (runtime)
  refable-value-kinds.schema.json  ← oneOf [static, ref] param versions
  schema.json                      ← graph structure + node definitions + x-outputs
  _generated/
    schema-types.d.ts              ← existing (graph node types)
    value-types.ts                 ← new: Value union and named variants
    node-outputs.ts                ← new: runtime outputs data per node type
src/graph/
  types.ts                         ← deleted
```

Node defs: no manual `outputs` arrays, `evaluate` return type narrowed automatically by `T`.
