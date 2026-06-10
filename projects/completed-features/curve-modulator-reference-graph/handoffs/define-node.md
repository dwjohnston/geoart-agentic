# define-node handoff: curve-modulator-module

**Kind:** module
**Type:** `curve-modulator-module`
**Description:** Module that modulates a curve using a wave oscillator and renders it with connect-the-dots and point visualization.

## Inputs
| Port | Type |
|---|---|
| `curve` | `colorPointArrayValueOrRef` |
| `cycleLengthMode` | `cycleLengthModeEnumValueOrRef` |
| `modulationAngle` | `numberValueOrRef` |
| `fixedOffset` | `numberValueOrRef` |

## Outputs
| Port | Type |
|---|---|
| `points` | `colorPointArrayValue` |

## Behaviour

The module:
1. Encapsulates an internal wave-module that generates a wave sampler
2. Uses the curveModulator compute node to modulate the input curve using the wave sampler, cycleLengthMode, modulationAngle, and fixedOffset parameters
3. Renders the modulated curve with a connect-the-dots render node (on the live layer)
4. Renders the modulated points with a point-render-module

The module outputs the modulated curve points for use by other nodes.
