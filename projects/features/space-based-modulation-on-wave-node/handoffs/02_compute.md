# compute-node handoff: wave modulator params

## Status

Implemented. All 26 tests pass (`bun test wave.test.ts`).

## What was done

The `wave` node's `sampler.sample(fractionOfOneCycle)` method now applies optional
`frequencyModulator` and `amplitudeModulator` inputs:

- The modulator's sampling position is `fractionOfOneCycle` shifted by a temporal
  phase offset derived from `modulatorTemporalImpact` (mirrors the existing
  `samplerTemporalImpact` logic but uses the separate scalar).
- `effectiveFrequency = frequency * (1 + frequencyModulator.sample(modulatorFraction))`
- `effectiveAmplitude = amplitude * (1 + amplitudeModulator.sample(modulatorFraction))`
- When a modulator is `null` the behaviour is identical to the previous implementation.
- The scalar `value` output is unchanged (no modulation applied there).

## Default values for the three new inputs

| Input | Default |
|---|---|
| `frequencyModulator` | `null` |
| `amplitudeModulator` | `null` |
| `modulatorTemporalImpact` | `0` |

## Notes for the algorithm agent

- Wire a second `wave` node's `sampler` output into `frequencyModulator` or
  `amplitudeModulator` on the primary wave node.
- `modulatorTemporalImpact: 0` means the modulator's spatial sampling position does
  not drift with time — set it to a non-zero value to animate the modulation pattern.
- The test demonstrates: a modulator returning a constant `1` with
  `frequency: 1, amplitude: 1` doubles the effective frequency/amplitude respectively,
  giving the same output as `frequency: 2` / `amplitude: 2` with no modulator.

## Example skeleton

```ts
// Modulator wave (drives frequency shaping)
{
  id: 'modulatorWave',
  type: 'wave',
  params: {
    frequency: { v: 2 },
    amplitude: { v: 1 },
    waveType: { v: 'sine' },
    samplerTemporalImpact: { v: 0 },
  },
},
// Primary wave with frequency modulation applied
{
  id: 'primaryWave',
  type: 'wave',
  params: {
    frequency: { v: 1 },
    amplitude: { v: 1 },
    waveType: { v: 'sine' },
    samplerTemporalImpact: { v: 0 },
    frequencyModulator: { ref: 'modulatorWave.sampler' },
    modulatorTemporalImpact: { v: 0 },
  },
},
```
