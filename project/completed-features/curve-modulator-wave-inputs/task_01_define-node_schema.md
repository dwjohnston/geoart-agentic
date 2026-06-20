# Task 01 — define-node: Add wave params to curve-modulator-module schema

Add the following params to the `curve-modulator-module` node definition in `src/schema/schema/schema.json`:

- `frequency` — `numberValueOrRef`
- `amplitude` — `numberValueOrRef`
- `phase` — `numberValueOrRef`
- `waveShape` — `waveTypeEnumValueOrRef`
- `samplerTemporalImpact` — `numberValueOrRef`

After editing schema.json, run `bun generate` to regenerate derived types.

Verify that `src/schema/_generated/node-inputs-2.ts` now includes these five fields under `curve-modulator-module`.
