# module-node handoff: wave-module

**Type:** `wave-module`

## Description

Wraps an internal wave oscillator (`wave` compute node) with optional FM and AM modulation. All modulation config is internal — no external socket connections beyond frequency, amplitude, and phase.

## Internal nodes generated

**Control nodes** (8 sliders/selectors, all namespaced `{moduleId}:*`):
- `wave-shape` — waveSelector, default `sine`
- `sampler-temporal-impact` — slider 0–1
- `fm-frequency` — slider 0.01–20
- `fm-amount` — slider 0–10 (modulation depth; 0 = no FM)
- `fm-temporal-impact` — slider 0–1
- `am-frequency` — slider 0.01–20
- `am-amount` — slider 0–1 (modulation depth; 0 = no AM)
- `am-temporal-impact` — slider 0–1

**Compute nodes** (4, all namespaced `{moduleId}:*`):
- `time` — current time
- `fm-wave` — FM oscillator feeding `frequencyModulator` of primary wave
- `am-wave` — AM oscillator feeding `amplitudeModulator` of primary wave
- `primary-wave` — main oscillator; wired from input marker for frequency/amplitude/phase

**Render nodes:** none

## Outputs
| Port | Ref |
|---|---|
| `value` | `{moduleId}:primary-wave.value` |
| `sampler` | `{moduleId}:primary-wave.sampler` |

## Algorithm skeleton

```ts
.addModuleNode({
  id: 'wave1',
  type: 'wave-module',
  params: {
    frequency: { v: 1 },
    amplitude: { v: 0.3 },
    phase: { v: 0 },
  },
})
```

Reference the sampler output:
```ts
modulator: { ref: 'wave1.sampler' }
```
