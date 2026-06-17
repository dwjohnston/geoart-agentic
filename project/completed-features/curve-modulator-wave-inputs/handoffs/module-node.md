# module-node handoff: curve-modulator-module wave inputs

## Description

The `curve-modulator-module` now exposes all five wave params as declared inputs. Internally it contains:

- A `wave-module` (wired to the five new pass-through inputs)
- A `curveModulator` compute node (wired to the wave-module's sampler output)
- A `connect-dots` render node (draws the modulated curve)
- A `point-render-module` (renders the modulated points)

All nine inputs (`curve`, `cycleLengthMode`, `modulationAngle`, `fixedOffset`, `frequency`, `amplitude`, `phase`, `waveShape`, `samplerTemporalImpact`) are settable as static values or refs from outside the module.

## Algorithm skeleton

```ts
.addModuleNode({
  id: 'modulator',
  type: 'curve-modulator-module',
  params: {
    curve: { ref: 'someCurve.points' },
    cycleLengthMode: { v: 'linearTotal' },
    modulationAngle: { v: 0.25 },
    fixedOffset: { v: 0 },
    frequency: { v: 2 },
    amplitude: { v: 0.3 },
    phase: { v: 0 },
    waveShape: { v: 'sine' },
    samplerTemporalImpact: { v: 0 },
  },
})
```
