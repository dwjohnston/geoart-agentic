# Feature Brief: Wave Module

## Summary

A module node that encapsulates a configurable wave oscillator. Designed to replace the pattern of manually wiring `wave` compute nodes.

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

- `waveShape` — dropdown: sine, square, triangle, sawtooth, and all other supported wave types
- `samplerTemporalImpact` — slider (0–1)

## Reference

See `src/algorithms/reference/node_specific/waveModulatorReferenceGraph.ts` for the existing manual wiring pattern this module replaces.
