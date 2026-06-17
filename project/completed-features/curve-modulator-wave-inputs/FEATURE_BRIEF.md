# Feature Brief: Curve Modulator Wave Inputs

## Summary

Update the curve-modulator-module to allow passing through all wave input values as module-level inputs.

## Background

The curve-modulator-module embeds a wave-module internally. Currently all five wave params are hardcoded:

- `frequency: { v: 1 }`
- `amplitude: { v: 0.5 }`
- `phase: { v: 0 }`
- `waveShape: { v: 'sine' }`
- `samplerTemporalImpact: { v: 0 }`

Users cannot connect external values to these params or adjust them via the module's control panel.

## Goal

Expose all five wave params as declared inputs on the curve-modulator-module so they can be:
- Set to static values via the control panel
- Connected to external sources via refs

## Acceptance Criteria

- `frequency`, `amplitude`, `phase`, `waveShape`, and `samplerTemporalImpact` appear as params in the schema for `curve-modulator-module`
- The module's `defaultValues` includes sensible defaults for all five
- The embedded wave-module is wired to `fromInput(...)` for each param
- All five params are rendered as controls in `renderControl`
- Existing tests pass; new tests cover the wave param wiring
