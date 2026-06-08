# Feature Brief: Space-Based Modulation on Wave Node

## Summary

Add space-based modulation support to `waveNode`, mirroring the pattern already established in `curveModulator`. This is purely additive — no migration of existing graphs or properties is needed.

## New Properties

Three new optional properties on `waveNode`:

1. `frequencyModulator` — space-based modulation of wave frequency
2. `amplitudeModulator` — space-based modulation of wave amplitude
3. `modulatorTemporalImpact` — controls how temporal position affects the modulator; works the same as `modulatorTemporalImpact` in `curveModulator`

## Behaviour

- `frequencyModulator` and `amplitudeModulator` follow the same space-based modulation approach used in `curveModulator`.
- `modulatorTemporalImpact` applies to both modulators in the same way it does in `curveModulator`.

## Deliverables

1. Schema changes — add the three new properties to the `waveNode` definition.
2. Compute implementation — apply modulators during wave evaluation.
3. Reference graph — a new example graph demonstrating space-based modulation on a wave node.

## Out of Scope

- Documentation (will be done manually).
- Migration of any existing graphs or nodes.
- Changes to any node type other than `waveNode`.
