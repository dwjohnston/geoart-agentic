# Task 01 — define-node-agent: Add modulator params to wave node schema

## Context

The `wave` compute node at line ~624 of `src/schema/schema/schema.json` currently has these params:
- `time`, `waveType`, `frequency`, `amplitude`, `phase`, `samplerTemporalImpact`

Three new optional params must be added to the `wave` node's `params` object — all optional (no additions to `required`).

## Changes Required

In `src/schema/schema/schema.json`, inside the Wave Compute Node `params.properties` object, add:

1. `frequencyModulator` — a sampler ref, used for space-based modulation of frequency:
   ```json
   "frequencyModulator": {
     "description": "Optional sampler for space-based modulation of wave frequency",
     "$ref": "refable-value-kinds.schema.json#/definitions/samplerValueOrRef"
   }
   ```

2. `amplitudeModulator` — a sampler ref, used for space-based modulation of amplitude:
   ```json
   "amplitudeModulator": {
     "description": "Optional sampler for space-based modulation of wave amplitude",
     "$ref": "refable-value-kinds.schema.json#/definitions/samplerValueOrRef"
   }
   ```

3. `modulatorTemporalImpact` — a number, same role as `samplerTemporalImpact` but applied to the modulators:
   ```json
   "modulatorTemporalImpact": {
     "description": "Temporal impact factor for the modulators (0-1) — controls intensity of time component in modulator phase",
     "$ref": "refable-value-kinds.schema.json#/definitions/numberValueOrRef"
   }
   ```

`samplerValueOrRef` already exists in `refable-value-kinds.schema.json` (it is used by `curveModulator`). No new value types are needed.

## Codegen

After editing the schema, run `bun generate` to regenerate derived files, then run `bun validate` to confirm all checks pass.

## Handoff

Write a handoff file to `projects/features/space-based-modulation-on-wave-node/handoffs/01_schema.md` containing:
- Confirmation the three params were added
- The exact param names as they appear in the schema
