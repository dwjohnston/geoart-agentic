# LFO Control

## Summary

A convenience control node that bundles the four parameters of a Low Frequency Oscillator into a single compact UI. It does not compute the oscillation — it purely outputs four values for wiring into a `wave` compute node.

## Outputs

| Port | Type | Default |
|------|------|---------|
| `baseValue` | `numberValue` | `0` |
| `frequency` | `numberValue` | `0.5` |
| `amplitude` | `numberValue` | `0` |
| `waveShape` | `waveTypeValue` | `"sine"` |

Defaults follow `sensible_defaults.md` — amplitude starts at `0` (silent) so the user dials it in.

## Schema Changes

Add `lfo-control` to `schema.json`:

1. Add `"lfo-control"` to the `controlNode` `oneOf` array.
2. Declare params (all from `value-kinds.schema.json` — control nodes take static values only):
   - `baseValue`: `numberValue`, default `0`
   - `frequency`: `numberValue`, default `0.5`
   - `amplitude`: `numberValue`, default `0`
   - `waveShape`: `waveTypeValue`, default `"sine"`
   - `waveShapeOptions`: `stringArrayValue`, default `["sine", "square", "saw", "inverse-saw", "triangle"]`
3. Declare `x-outputs` with the four output ports only (not `waveShapeOptions` — that is config only).

`waveShapeOptions` is a static config param, not an output. The `LfoControl.tsx` component reads it to populate the dropdown — the same pattern used by `DropdownNode`'s `options` param.

## Runtime Implementation

`src/nodes/control/nodes/LfoControlNode.tsx` using `defineControlNode`. The `waveShapeOptions` default matches the `stringArrayValue` structure (array of `{ v: string }`). `set` is called per-port — the existing `ControlSetter<K>` signature already accepts a port name, so no plumbing changes are needed.

## UI Component — `LfoControl.tsx`

`src/nodes/control/ui/LfoControl.tsx`

```
┌─────────────────────────────┐
│  ┌──────┐   [wave shape ▼]  │
│  │      │   ○  freq         │
│  │  ◎   │   ○  amp          │
│  │ base │                   │
└─────────────────────────────┘
```

- **Large knob** (left) — `baseValue`, range `-1` to `1`
- **Dropdown** (top right) — `waveShape`, options sourced from `waveShapeOptions` prop
- **Small knob** (middle right) — `frequency`, range `0.001` to `1`
- **Small knob** (bottom right) — `amplitude`, range `0` to `1`

## Knob Component — `KnobControl.tsx`

New shared primitive at `src/nodes/control/ui/KnobControl.tsx`:

- Circle with a rotated indicator line
- Two sizes: `sm` and `lg` via a `size` prop
- Click-drag vertically; 200 px travel = full range sweep
- Props: `value`, `min`, `max`, `size`, `onChange`
- Pure presentational — no schema involvement

## Registration

Add `['lfo-control', lfoControlNodeDef]` to `src/nodes/control/registry.ts`.
