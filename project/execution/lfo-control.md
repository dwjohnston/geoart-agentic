# Plan: LFO Control

## Status

| Task | Agent | Status |
|------|-------|--------|
| T1: Schema changes | schema-agent | ⬜ pending |
| T4: KnobControl component | control-agent | ⬜ pending |
| T2: resolveEnumValues | schema-agent | ⬜ pending |
| T3: validateEnumRefs validator | graph-agent | ⬜ pending |
| T5: LfoControlNode + registry + LfoControl.tsx | control-agent | ⬜ pending |
| T6: LfoRegistration plumbing | ⚠️ needs decision — see T6 | ⬜ pending |
| T7: DropdownControl update | control-agent | ⬜ pending |

## Dependency Graph

```
[T1: Schema] ──────┬──► [T2: resolveEnumValues]  ──────────┐
[T4: KnobControl]  │                                        │
(parallel, no dep) ├──► [T3: validateEnumRefs]              │
                   ├──► [T5: LfoControlNode + UI] ──────────┼──► [T7: DropdownControl]
                   └──► [T6: LfoRegistration] ──────────────┘
```

**Wave 1 (parallel):** T1, T4  
**Wave 2 (parallel, after T1):** T2, T3, T5, T6  
**Wave 3:** T7 (after T2, T5, T6)

---

## T1 — Schema changes

**Agent:** schema-agent  
**Files:** `src/schema/schema.json`, then regenerate `src/schema/_generated/schema-types.d.ts`

Add the following to `schema.json`:

1. New definition `stringArrayOrEnumValuesParam`:
```json
"stringArrayOrEnumValuesParam": {
  "title": "String Array or Enum Values Param",
  "description": "Either a literal string array or a reference to a named enum definition",
  "oneOf": [
    {
      "title": "Literal options",
      "type": "object",
      "additionalProperties": false,
      "required": ["v"],
      "properties": {
        "v": { "title": "Values", "type": "array", "items": { "type": "string" } },
        "locked":  { "$ref": "#/definitions/lockedProp" },
        "comment": { "$ref": "#/definitions/commentProp" }
      }
    },
    {
      "title": "Enum reference",
      "type": "object",
      "additionalProperties": false,
      "required": ["enumRef"],
      "properties": {
        "enumRef": {
          "title": "Enum Ref",
          "description": "Name of a definitions entry in schema.json whose static branch enumerates the valid string values",
          "type": "string"
        }
      }
    }
  ]
}
```

2. Update the `dropdown` node's `options` property from `stringParam` to `$ref: "#/definitions/stringArrayOrEnumValuesParam"`.

3. Add `"lfo-control"` to the control layer node type enum.

4. Add a new `lfo-control` node definition in the control `oneOf` array:
```json
{
  "title": "LFO Control Node",
  "type": "object",
  "additionalProperties": false,
  "required": ["id", "type"],
  "properties": {
    "id":   { "title": "ID",   "type": "string" },
    "type": { "title": "Type", "type": "string", "enum": ["lfo-control"] },
    "params": {
      "title": "Params",
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "baseValue":        { "$ref": "#/definitions/numberParam" },
        "frequency":        { "$ref": "#/definitions/numberParam" },
        "amplitude":        { "$ref": "#/definitions/numberParam" },
        "waveShape":        { "$ref": "#/definitions/waveTypeEnumParam" },
        "waveShapeOptions": { "$ref": "#/definitions/stringArrayOrEnumValuesParam" }
      }
    }
  }
}
```

After editing `schema.json`, regenerate types by running:
```
bun run generate:types
```
(check `package.json` for the exact script name).

---

## T4 — KnobControl component

**Agent:** control-agent  
**Files:** `src/nodes/control/ui/KnobControl.tsx` (new)

No schema dependency. Implement a round knob as a **variant of the existing `SliderControl`** — same value/range/onChange contract, different visual presentation and interaction.

Read `src/nodes/control/ui/SliderControl.tsx` first and follow its conventions.

Spec:
- Two sizes: `'sm'` (40px diameter) and `'lg'` (80px diameter)
- SVG-based: outer circle, indicator line from centre to edge at a rotation angle
- Rotation range: -135° (min) to +135° (max), i.e. 270° total sweep
- Interaction: `onPointerDown` captures the pointer; vertical drag changes value
  - 200px upward drag = full range increase; 200px downward = full range decrease
  - Clamp output to `[min, max]`
- `useRef` for drag start Y position and drag start value
- Release pointer capture on `pointerup` / `pointercancel`

```typescript
type Props = {
  value: number;
  min: number;
  max: number;
  size: 'sm' | 'lg';
  onChange: (value: number) => void;
};
```

Pure presentational component — no schema entry, no registry entry.

Do not use `!` non-null assertion — use `NeverShouldHappenError` from `src/common-tooling/errors/NeverShouldHappenError.ts` if needed.

---

## T2 — resolveEnumValues

**Agent:** schema-agent  
**Files:** `src/schema/enumValues.ts` (new)

Depends on T1.

Implement and export `resolveEnumValues(enumRef: string): string[]`.

Reads `schema.json` directly (import as JSON) and extracts the enum values from:
`schema.definitions[enumRef].oneOf[0].properties.v.enum`

If the path does not resolve, throw a descriptive `Error`. This is fail-fast — bad refs are caught earlier by `validateEnumRefs` (T3).

Write a unit test in `src/schema/enumValues.test.ts` — at minimum, assert that `resolveEnumValues('waveTypeEnumParam')` returns `['sine', 'square', 'saw', 'inverse-saw', 'triangle']`.

---

## T3 — validateEnumRefs validator

**Agent:** graph-agent  
**Files:** `src/graph/validators/enumRefs.ts` (new), `src/graph/validators/index.ts` (edit)

Depends on T1.

Implement `validateEnumRefs(graph: GeoArtGraph): ValidationError[]`.

Walk all params on all nodes across all three layers (control, compute, render). For each param that is an object containing an `enumRef` key, check that `schema.definitions` has that key. If not, push a `ValidationError`:

```typescript
{
  code: 'INVALID_ENUM_REF',
  severity: 'error',
  message: `Unknown enumRef "${enumRef}" on "${node.id}.${paramName}". ...`,
  nodeId: node.id,
  paramName,
}
```

Wire into `validateGraphSemantics` in `src/graph/validators/index.ts` alongside the other validators.

Write at least two tests in `src/graph/validators/validators.test.ts`:
- A graph with a valid `enumRef` (`"waveTypeEnumParam"`) — no errors.
- A graph with an invalid `enumRef` (`"nonExistentEnumParam"`) — one `INVALID_ENUM_REF` error.

---

## T5 — LfoControlNode + registry + LfoControl.tsx

**Agent:** control-agent  
**Files:**
- `src/nodes/control/LfoControlNode.ts` (new)
- `src/nodes/control/registry.ts` (edit)
- `src/nodes/control/ui/LfoControl.tsx` (new)
- `src/application/Controls.tsx` (edit)

Depends on T1, T2, T4, T6.

**Note:** T5 is split into two concerns that belong together:
- `LfoControlNode.ts` is the data/logic layer (equivalent to `SliderNode.ts`)
- `LfoControl.tsx` is the UI component (equivalent to `SliderControl.tsx`)

### LfoControlNode.ts

```typescript
import type { ControlNodeDef } from './types';

export const lfoControlNodeDef: ControlNodeDef = {
  type: 'lfo-control',
  outputs: [
    { name: 'baseValue', type: 'number' },
    { name: 'frequency', type: 'number' },
    { name: 'amplitude', type: 'number' },
    { name: 'waveShape', type: 'string' },
  ],
  params: {
    baseValue:        { type: 'number' },
    frequency:        { type: 'number' },
    amplitude:        { type: 'number' },
    waveShape:        { type: 'waveTypeEnum' },
    waveShapeOptions: { type: 'stringArrayOrEnum' },
  },
  evaluate(params) {
    return [
      { kind: 'number', v: (params['baseValue']?.v as number) ?? 0     },
      { kind: 'number', v: (params['frequency']?.v as number) ?? 0.1   },
      { kind: 'number', v: (params['amplitude']?.v as number) ?? 0.5   },
      { kind: 'string', v: (params['waveShape']?.v as string) ?? 'sine' },
    ];
  },
};
```

Register in `src/nodes/control/registry.ts`.

### LfoControl.tsx

Composite control widget matching the sketch:

```
┌─────────────────────────────┐
│  ┌──────┐   [wave shape ▼]  │
│  │      │   ○  freq         │
│  │  ◎   │   ○  amp          │
│  │ base │                   │
└─────────────────────────────┘
```

- Large `KnobControl` (`size="lg"`, min=-1, max=1) — `baseValue`
- `<select>` populated via `resolveEnumValues('waveTypeEnumParam')` — `waveShape`
- Small `KnobControl` (`size="sm"`, min=0, max=1) — `frequency`
- Small `KnobControl` (`size="sm"`, min=0, max=1) — `amplitude`

Props:
```typescript
type Props = {
  node: LfoControlNode;          // from schema-types
  registration: LfoRegistration; // from graphEngine — see T6
};
```

Each control calls the appropriate setter on `registration`.

Initial values from `node.params.*?.v` with same defaults as `evaluate`.

### Controls.tsx

Add:
```typescript
if (reg.type === 'lfo-control') {
  return <LfoControl key={reg.node.id} node={reg.node} registration={reg} />;
}
```

---

## T6 — LfoRegistration plumbing

**Agent:** general-purpose (or control-agent — TBD after decision below)  
**Files:** `src/graphEngine/graphEngine.ts` (edit)

Depends on T1.

### ⚠️ Decision required before implementing

The LFO has 4 independent outputs. Three options were discussed:

**Option 1 — Per-port setters (recommended):**
```typescript
export type LfoRegistration = {
  type: 'lfo-control';
  node: LfoControlNode;
  setBaseValue: (v: number) => void;
  setFrequency: (v: number) => void;
  setAmplitude: (v: number) => void;
  setWaveShape: (v: string) => void;
};
```
Consistent with existing pattern. Each registration is self-contained and fully typed. No changes to existing registration types.

**Option 2 — Generic port-name setter:**
```typescript
export type LfoRegistration = {
  type: 'lfo-control';
  node: LfoControlNode;
  setValue: (portName: string, value: Value) => void;
};
```
More flexible, less verbose. Requires `Value` import at the call site.

**Option 3 — Single object setter:**
```typescript
export type LfoRegistration = {
  type: 'lfo-control';
  node: LfoControlNode;
  setValues: (values: { baseValue: number; frequency: number; amplitude: number; waveShape: string }) => void;
};
```
Always updates all 4 at once. Simpler but forces the UI to always send all values even when only one changed.

Add `LfoRegistration` to the `ControlRegistration` union in `graphEngine.ts`. In `load`, add a branch for `node.type === 'lfo-control'`. Each setter calls `mutateControl` — inspect how `mutateControl` is currently implemented and extend it to target a specific output port if needed (currently it likely assumes a single output per node).

Do not change `SliderRegistration`, `ColorPickerRegistration`, or `DropdownRegistration`.

---

## T7 — DropdownControl update

**Agent:** control-agent  
**Files:** `src/nodes/control/ui/DropdownControl.tsx` (edit)

Depends on T2, T5, T6.

Update to resolve options from either a literal array or an `enumRef`:

```typescript
import { resolveEnumValues } from '../../../schema/enumValues';

const rawOptions = params.options;
const options: string[] = rawOptions
  ? ('enumRef' in rawOptions
      ? resolveEnumValues(rawOptions.enumRef)
      : rawOptions.v ?? [])
  : [];
```

The rest of the component is unchanged.
