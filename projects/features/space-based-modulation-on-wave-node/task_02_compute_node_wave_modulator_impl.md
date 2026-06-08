# Task 02 — compute-node-agent: Apply modulators in wave node implementation

## Context

Read the handoff from task 01: `projects/features/space-based-modulation-on-wave-node/handoffs/01_schema.md`.

The `wave` compute node is implemented in `src/nodes/compute/nodes/wave.ts`.

It currently exposes two outputs:
- `value` — a scalar number evaluated at the current tick
- `sampler` — a `Sampler` object whose `sample(fractionOfOneCycle)` method evaluates the wave at an arbitrary spatial position

The `sampler` output is what downstream nodes (e.g. `curveModulator`) call to apply space-based modulation. The three new schema params must be wired into the `sampler`'s evaluation logic.

## Behaviour to Implement

The `sampler.sample(spatialPosition)` method currently applies a single `frequency` and `amplitude` to all spatial positions. After this change:

- If `frequencyModulator` is provided, the effective frequency at a given `spatialPosition` is:
  `effectiveFrequency = frequency * (1 + frequencyModulator.sample(spatialPosition_for_modulator))`
  where `spatialPosition_for_modulator` is derived from `spatialPosition` with the same temporal phase-shift logic currently used in the main sampler, but scaled by `modulatorTemporalImpact` instead of `samplerTemporalImpact`.

- If `amplitudeModulator` is provided, the effective amplitude at a given `spatialPosition` is:
  `effectiveAmplitude = amplitude * (1 + amplitudeModulator.sample(spatialPosition_for_modulator))`
  using the same `spatialPosition_for_modulator`.

- `modulatorTemporalImpact` defaults to `0` (no temporal drift on the modulator). The existing `samplerTemporalImpact` is unchanged.

- Both modulators are optional (nullable). If absent, behaviour is identical to the current implementation.

- The scalar `value` output (non-sampler path) is unchanged — it uses fixed `frequency` and `amplitude` as before.

## Implementation Notes

- `frequencyModulator` and `amplitudeModulator` arrive as `Sampler | null` (same type as `curveModulator`'s `modulator` input — see `src/nodes/compute/nodes/curveModulator.ts` for the existing `Sampler` usage pattern).
- Add defaults: `frequencyModulator: null`, `amplitudeModulator: null`, `modulatorTemporalImpact: 0`.
- Keep the existing `evaluateWave` and `evaluateWaveAtAngle` helper functions unchanged.
- The modulator's own spatial sampling position should be the same `fractionOfOneCycle` passed to the outer sampler, shifted by a temporal phase offset derived from `modulatorTemporalImpact`.

## Tests

Update `src/nodes/compute/nodes/wave.test.ts`:
- Add a test verifying that when `frequencyModulator` returns a constant, the sampler output changes accordingly.
- Add a test verifying that when `amplitudeModulator` returns a constant, the sampler output scales accordingly.
- Existing tests must continue to pass.

Run `bun test wave.test.ts` to confirm.

## Handoff

Write a handoff file to `projects/features/space-based-modulation-on-wave-node/handoffs/02_compute.md` containing:
- Confirmation of implementation
- The exact default values used for the three new inputs
- Any notes the algorithm agent should know when wiring up the reference graph
