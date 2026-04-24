# LFO Control

## Summary

A convenience control node that bundles the four parameters of a Low Frequency Oscillator into a single compact UI. It does not compute the oscillation — it purely outputs four values for wiring into a wave compute node.

## Outputs

| Port | Type | Range | Notes |
|------|------|-------|-------|
| `baseValue` | number | -1 to 1 | Centre offset of the oscillation |
| `frequency` | number | 0–1 (normalised) | Cycles per 60 ticks |
| `amplitude` | number | 0–1 | Depth of oscillation |
| `waveShape` | string | `waveTypeEnumParam` values | One of `sine`, `square`, `saw`, `inverse-saw`, `triangle` |

## UI Layout

Loosely based on the sketch provided:

```
┌─────────────────────────────┐
│  ┌──────┐   [wave shape ▼]  │
│  │      │   ○  freq         │
│  │  ◎   │   ○  amp          │
│  │ base │                   │
└─────────────────────────────┘
```

- **Large knob** (left) — `baseValue`
- **Dropdown** (top right) — `waveShape`
- **Small knob** (middle right) — `frequency`
- **Small knob** (bottom right) — `amplitude`

## Round Knob Control (new shared component)

A new `KnobControl` component, a variant of `SliderControl`:

- Rendered as a circle with a position indicator line (like a clock hand)
- Two sizes: `sm` and `lg`
- Interaction: click-drag vertically — drag up increases value, drag down decreases
- 200px vertical travel = full range sweep
- Pure UI component — no schema entry

## Wave Shape Dropdown — `stringArrayOrEnumValuesParam`

Introduce a new param type `stringArrayOrEnumValuesParam` in `schema.json`. This type is either a literal string array or an enum reference:

```json
{ "v": ["option-a", "option-b"] }      // literal array
{ "enumRef": "waveTypeEnumParam" }      // schema enum reference
```

The `DropdownNode`'s `options` param is updated to use this type.

A `resolveEnumValues(enumRef)` function lives in `src/schema/enumValues.ts`. It extracts the `enum` array directly from `schema.json` at the path `definitions[enumRef].oneOf[0].properties.v.enum`. The schema remains the single source of truth — no separate constants file.

`LfoControlNode` declares a `waveShapeOptions` param of type `stringArrayOrEnumValuesParam`, stored as `{ "enumRef": "waveTypeEnumParam" }`. The `LfoControl.tsx` component passes this through `resolveEnumValues` to populate its dropdown — same path as `DropdownControl`.

## Schema Changes

1. Add `stringArrayOrEnumValuesParam` definition.
2. Update `DropdownNode`'s `options` param to `$ref: stringArrayOrEnumValuesParam`.
3. Add `lfo-control` to the control layer node type enum.
4. Add `lfo-control` node definition with params:
   - `baseValue`: `numberParam`, default `0`
   - `frequency`: `numberParam`, default `0.1`
   - `amplitude`: `numberParam`, default `0.5`
   - `waveShape`: `waveTypeEnumParam`, default `"sine"`
   - `waveShapeOptions`: `stringArrayOrEnumValuesParam`, value `{ enumRef: "waveTypeEnumParam" }`

## `enumRef` Validation

`stringArrayOrEnumValuesParam` allows `{ "enumRef": "someEnumParam" }`. JSON Schema validates the shape but cannot verify the ref resolves to a real definition.

A new semantic validator `validateEnumRefs` is added to `src/graph/validators/enumRefs.ts` and wired into `validateGraphSemantics`. It:

- Walks all params across all layers (control, compute, render)
- For any param containing an `enumRef` key, checks `schema.definitions` contains that key
- Returns an `INVALID_ENUM_REF` error if not found

This catches stale or misspelled enum refs at load time rather than at the point `resolveEnumValues` is called.

## `onChange` Plumbing

`LfoControlNode` has 4 outputs. The existing `ControlRegistration.setValue(value)` signature handles a single value. This needs extending to carry a port name:

```typescript
setValue(portName: string, value: Value)
```

`SliderControlNode`, `ColorPickerControlNode`, `DropdownControlNode` each have one output so are unaffected — they can pass a fixed port name (`"value"`).


