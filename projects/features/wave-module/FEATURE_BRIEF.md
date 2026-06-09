# Feature Brief: Wave Module

## Summary

A module node that encapsulates a configurable wave oscillator with optional FM and AM modulation. Designed to replace the pattern of manually wiring `wave` compute nodes with modulator waves.

## Node Type

Module node — `wave`

## Socket Inputs

| Name | Type | Description |
|---|---|---|
| `frequency` | number | Primary oscillator frequency |
| `amplitude` | number | Primary oscillator amplitude |
| `phase` | number | Primary oscillator phase offset |

## Outputs

| Name | Type | Description |
|---|---|---|
| `value` | number | Current wave value evaluated at time t |
| `sampler` | sampler | Callable for use with `curveModulator` |

## Internal Controls

### Primary wave
- `waveShape` — dropdown: sine, square, triangle, sawtooth, and all other supported wave types
- `samplerTemporalImpact` — slider (0–1)

### FM (Frequency Modulation)
Internal oscillator that modulates the primary frequency.
- `fmFrequency` — slider
- `fmAmount` — slider (modulation depth)
- `fmTemporalImpact` — slider (0–1)

### AM (Amplitude Modulation)
Internal oscillator that modulates the primary amplitude.
- `amFrequency` — slider
- `amAmount` — slider (modulation depth)
- `amTemporalImpact` — slider (0–1)

FM and AM modulators use the same wave type as the primary oscillator.

## Reference

See `src/algorithms/reference/node_specific/waveModulatorReferenceGraph.ts` for the existing manual wiring pattern this module replaces.

## Out of Scope

- Exposing FM/AM as socket inputs (all modulation is internal-only)
- FM/AM modulator shape independent of primary wave shape
