# define-node handoff: curve-modulator-module wave inputs

**Kind:** module
**Type:** `curve-modulator-module`
**Description:** Exposes all five wave-module input params as pass-through inputs on the curve-modulator-module.

## New Input Ports Added

| Port | Type |
|---|---|
| `frequency` | `numberValueOrRef` |
| `amplitude` | `numberValueOrRef` |
| `phase` | `numberValueOrRef` |
| `waveShape` | `waveTypeEnumValueOrRef` |
| `samplerTemporalImpact` | `numberValueOrRef` |

## Existing Input Ports (unchanged)

| Port | Type |
|---|---|
| `curve` | `colorPointArrayValueOrRef` |
| `cycleLengthMode` | `cycleLengthModeEnumValueOrRef` |
| `modulationAngle` | `numberValueOrRef` |
| `fixedOffset` | `numberValueOrRef` |

## Outputs (unchanged)

| Port | Type |
|---|---|
| `points` | `colorPointArrayValue` |

## Behaviour

The module implementation must:
1. Add all five new params to `defaultValues` with the same defaults currently hardcoded in the wave-module params block (`frequency: 1`, `amplitude: 0.5`, `phase: 0`, `waveShape: 'sine'`, `samplerTemporalImpact: 0`)
2. Replace the hardcoded wave-module params with `fromInput(...)` refs
3. Add UI controls for all five params in `renderControl`
