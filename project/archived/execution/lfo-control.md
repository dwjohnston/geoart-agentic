# LFO Control — Execution Plan

## Status

| Task | Agent | Status |
|------|-------|--------|
| A: Add `lfo-control` to schema | schema-agent | pending |
| B: Regenerate `_generated` files | schema-agent | pending |
| C: Implement `LfoControlNode.tsx` + `KnobControl.tsx` + `LfoControl.tsx` | control-node-agent | pending |
| D: Register in `registry.ts` | control-node-agent | pending |

## Dependency Graph

```
A (schema) → B (regenerate) → C (implement node + UI) → D (register)
```

All steps are sequential. Tasks A and B can be done by the same schema-agent invocation. Tasks C and D can be done by a single control-node-agent invocation after B is complete.

---

## Task A + B — Schema + Regeneration

### Agent: schema-agent

Add the `lfo-control` node to `src/schema/schema/schema.json`, then regenerate the `_generated` files.

**Step A — Add to schema**

In `src/schema/schema/schema.json`, inside the `controlNode` `oneOf` array, append a new entry after the `dropdown` entry:

```json
{
  "title": "LFO Control Node",
  "type": "object",
  "description": "Bundles the four LFO parameters into one compact control — outputs baseValue, frequency, amplitude, and waveShape for wiring into a wave compute node",
  "additionalProperties": false,
  "required": ["id", "type", "params"],
  "x-outputs": [
    { "name": "baseValue",  "valueType": "numberValue" },
    { "name": "frequency",  "valueType": "numberValue" },
    { "name": "amplitude",  "valueType": "numberValue" },
    { "name": "waveShape",  "valueType": "waveTypeValue" }
  ],
  "properties": {
    "id":   { "title": "ID",   "type": "string" },
    "type": { "title": "Type", "type": "string", "enum": ["lfo-control"] },
    "params": {
      "title": "Params",
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "baseValue":        { "$ref": "value-kinds.schema.json#/definitions/numberValue" },
        "frequency":        { "$ref": "value-kinds.schema.json#/definitions/numberValue" },
        "amplitude":        { "$ref": "value-kinds.schema.json#/definitions/numberValue" },
        "waveShape":        { "$ref": "value-kinds.schema.json#/definitions/waveTypeValue" },
        "waveShapeOptions": { "$ref": "value-kinds.schema.json#/definitions/stringArrayValue" }
      }
    }
  }
}
```

Note: `waveShapeOptions` is a config-only param (it populates the dropdown). It is NOT in `x-outputs`.

**Step B — Regenerate**

Run the existing generation scripts to update:
- `src/schema/_generated/node-outputs-2.ts` — will gain an `"lfo-control"` entry with the four output ports
- `src/schema/_generated/node-inputs-2.ts` — will gain an `"lfo-control"` entry with all five params
- `src/schema/_generated/schema-types.d.ts` — will gain the `LfoControlNode` type

Check the `package.json` scripts for the correct generation command (likely `bun run generate:schema-types` or similar). Run it and verify the `_generated` files are updated.

---

## Task C + D — Node Implementation + Registration

### Agent: control-node-agent

Implement after Task B is complete. Read the generated files first to confirm the new types are present.

**Step C1 — `KnobControl.tsx`**

Create `src/nodes/control/ui/KnobControl.tsx`:

- A circular knob with a rotated indicator line
- Click-drag vertically: 200 px travel = full range sweep
- Two sizes via a `size: 'sm' | 'lg'` prop
- Props: `value: number`, `min: number`, `max: number`, `size: 'sm' | 'lg'`, `label: string`, `onChange: (value: number) => void`
- Pure presentational — no schema involvement
- Use `useState` + `useRef` + mouse event handlers (`onMouseDown` on the knob; `mousemove`/`mouseup` on `document` while dragging)
- Indicator line rotates from -135° (min) to +135° (max)

**Step C2 — `LfoControl.tsx`**

Create `src/nodes/control/ui/LfoControl.tsx`:

Layout:
```
┌─────────────────────────────┐
│  ┌──────┐   [wave shape ▼]  │
│  │      │   ○  freq         │
│  │  ◎   │   ○  amp          │
│  │ base │                   │
└─────────────────────────────┘
```

Props:
```ts
type Props = {
  id: string;
  baseValue: number;
  frequency: number;
  amplitude: number;
  waveShape: string;
  waveShapeOptions: string[];
  onBaseValueChange: (v: number) => void;
  onFrequencyChange: (v: number) => void;
  onAmplitudeChange: (v: number) => void;
  onWaveShapeChange: (v: string) => void;
};
```

- Large `KnobControl` (size `'lg'`) for `baseValue`, range `-1` to `1`, label `"base"`
- `DropdownControl` (re-use existing) for `waveShape`, options from `waveShapeOptions`
- Small `KnobControl` (size `'sm'`) for `frequency`, range `0.001` to `1`, label `"freq"`
- Small `KnobControl` (size `'sm'`) for `amplitude`, range `0` to `1`, label `"amp"`

**Step C3 — `LfoControlNode.tsx`**

Create `src/nodes/control/nodes/LfoControlNode.tsx`:

```ts
import { defineControlNode } from '../types';
import { LfoControl } from '../ui/LfoControl';

export const lfoControlNodeDef = defineControlNode('lfo-control', {
  defaults: {
    baseValue:        { v: 0 },
    frequency:        { v: 0.5 },
    amplitude:        { v: 0 },
    waveShape:        { v: 'sine' },
    waveShapeOptions: { v: [{ v: 'sine' }, { v: 'square' }, { v: 'saw' }, { v: 'reverse-saw' }, { v: 'triangle' }] },
  },
  renderControl(node, set) {
    return (
      <LfoControl
        id={node.id}
        baseValue={node.params.baseValue.v}
        frequency={node.params.frequency.v}
        amplitude={node.params.amplitude.v}
        waveShape={node.params.waveShape.v}
        waveShapeOptions={node.params.waveShapeOptions.v.map(s => s.v)}
        onBaseValueChange={v => set('baseValue', { v })}
        onFrequencyChange={v => set('frequency', { v })}
        onAmplitudeChange={v => set('amplitude', { v })}
        onWaveShapeChange={v => set('waveShape', { v })}
      />
    );
  },
});
```

**Step D — Register**

In `src/nodes/control/registry.ts`, import `lfoControlNodeDef` and add `['lfo-control', lfoControlNodeDef as ControlNodeDef]` to the map.

---

## Notes for agents

- The `waveTypeValue` in `value-kinds.schema.json` uses `"reverse-saw"` (not `"inverse-saw"`). Match exactly.
- Amplitude default is `0` (silent on load) per `sensible_defaults.md`.
- Frequency default is `0.5` per `sensible_defaults.md`.
- `waveShapeOptions` is config-only: drives the dropdown but is not an output port. Do not pass it to `set`.
- Run `bun run test:headless --run` after completing tasks to verify nothing is broken.
