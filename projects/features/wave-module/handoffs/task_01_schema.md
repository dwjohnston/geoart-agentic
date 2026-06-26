# define-node handoff: wave-module

**Kind:** module
**Type:** `wave-module`
**Description:** Wave oscillator module with optional FM and AM modulation.

## Inputs
| Port | Type |
|---|---|
| `frequency` | `numberValueOrRef` |
| `amplitude` | `numberValueOrRef` |
| `phase` | `numberValueOrRef` |

## Outputs
| Port | Type |
|---|---|
| `value` | `numberValue` |
| `sampler` | `samplerValue` |

## Behaviour

The module wraps an internal wave oscillator. Socket inputs (frequency, amplitude, phase) are wired in from outside. All other configuration is internal:

- **Wave shape** — dropdown selecting the oscillator waveform (sine, square, triangle, sawtooth, etc.)
- **Sampler temporal impact** — slider (0–1) controlling how much time vs. spatial position drives the sampler
- **FM** — internal frequency modulator oscillator with: fmFrequency, fmAmount (modulation depth), fmTemporalImpact
- **AM** — internal amplitude modulator oscillator with: amFrequency, amAmount (modulation depth), amTemporalImpact

FM and AM modulators use the same wave shape as the primary oscillator.

The `value` output is the current wave value evaluated at time t.
The `sampler` output is a callable used by `curveModulator` to evaluate the wave at spatial positions along a curve.

## Reference

See `src/algorithms/reference/node_specific/waveModulatorReferenceGraph.ts` for the manual wiring pattern this module replaces. The existing `wave` compute node (type: `"wave"`) is the internal oscillator primitive.
