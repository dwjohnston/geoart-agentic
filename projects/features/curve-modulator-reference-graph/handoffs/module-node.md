# module-node handoff: curve-modulator-module

## Description

The curve-modulator module provides parametric modulation of a curve using an internal wave oscillator. It composes three internal structures:

1. **Internal wave-module** — Generates a wave sampler that drives the modulation
2. **curveModulator compute node** — Takes the input curve and applies displacement based on the wave sampler, cycleLengthMode, modulationAngle, and fixedOffset
3. **Rendering pipeline** — A connect-the-dots render node (live layer) visualises the modulated curve, and a point-render-module renders the individual points with circles and crosshairs

The module outputs the modulated curve points for downstream use.

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

## Implementation Details

**Nested modules:** The module declares two nested module nodes:
- `wave-module` — Instantiated with default frequency, amplitude, phase, and sine waveShape
- `point-render-module` — Connected to the output of the curveModulator compute node

**Compute nodes:** One curveModulator node wires:
- `curve` input → input marker
- `modulator` ← wave-module sampler
- `cycleLengthMode` input → input marker
- `modulationAngle` input → input marker
- `fixedOffset` input → input marker

**Render nodes:** One connect-dots render node (live layer) displays the modulated curve using catmull-rom interpolation.

## Algorithm Skeleton

```typescript
.addModuleNode({
  id: 'myModulator',
  type: 'curve-modulator-module',
  params: {
    curve: { v: [] },
    cycleLengthMode: { v: 'arrayLength' },
    modulationAngle: { v: 0.25 },
    fixedOffset: { v: 0.05 },
  },
})
```

Replace values as needed for your algorithm. The `curve` parameter can be fed from an upstream node or left as a static empty array (default).
