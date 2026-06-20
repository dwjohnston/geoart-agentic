# Task 01: Define Schema

Skill: `define-node`

## What to define

Make all schema changes for the color-sampler feature. This is the only schema task — all downstream tasks depend on these definitions being in place.

### 1. New value kind: `colorSamplerValue`

Add to `src/schema/schema/value-kinds.schema.json`.

Runtime-only placeholder, same pattern as `samplerValue`:

```json
"colorSamplerValue": {
  "title": "Color Sampler Value",
  "type": "object",
  "description": "Runtime-only function wrapper. Contains sample(t) function returning { r, g, b, a }. Cannot be statically defined in JSON.",
  "additionalProperties": false,
  "required": ["v"],
  "properties": {
    "v": {
      "type": "object",
      "description": "Placeholder — actual value is a ColorSampler object at runtime"
    }
  }
}
```

Also add the corresponding TypeScript type to `src/schema/typeHelpers.ts`:

```typescript
export type ColorSampler = {
  sample(t: number): { r: number; g: number; b: number; a: number }
}
```

### 2. New enum value kind: `colorSamplerModeEnumValue`

Add to `value-kinds.schema.json`. Enum with one value for now: `clobber`.

Also add a selector control node entry to `schema.json` (see item 5 below).

### 3. New compute node: `valueSampler`

Add to `src/schema/schema/schema.json` under compute nodes.

- Input: `value` — numberValue
- Output: `sampler` — samplerValue

### 4. New compute node: `colorSampler`

Add to `schema.json` under compute nodes.

- Inputs: `sampleR`, `sampleG`, `sampleB`, `sampleA` — all samplerValue
- Input: `mode` — colorSamplerModeEnumValue
- Output: `colorSampler` — colorSamplerValue

### 5. New control node: `colorSamplerModeSelector`

Add to `schema.json` under control nodes. Dropdown selector for `colorSamplerModeEnumValue`. Output: `mode` — colorSamplerModeEnumValue.

### 6. Update existing compute node: `orbit`

Add optional input to the existing `orbit` node schema entry:
- `colorSampler` — colorSamplerValue (optional)

### 7. Update existing compute node: `pointsOnALine`

Add optional input to the existing `pointsOnALine` node schema entry:
- `colorSampler` — colorSamplerValue (optional)

## Handoff

Write `project/features/color-sampler/handoffs/task_01_define-node.md` containing:
- The exact enum value kind name chosen (e.g. `colorSamplerModeEnumValue`)
- The enum values (currently: `clobber`)
- The control node type name chosen (e.g. `colorSamplerModeSelector`)

Task 02 reads this handoff to implement the control node.
