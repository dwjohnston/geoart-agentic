# Task 01 — define-node: Add points-on-a-line-v2-module to schema

Add a new module node definition to `src/schema/schema/schema.json`.

## Node kind

`points-on-a-line-v2-module`

## Outputs

- `points` — `colorPointArrayValue`

## Params

- `colorPoints` — `colorPointArrayValueOrRef`
- `numPoints` — `numberValueOrRef`
- `curveMode` — `curveModeEnumValueOrRef`

## Pattern

Follow the same pattern as `rotate-module` at the end of the `moduleNodes` `oneOf` array in `schema.json`. Add the new entry after `rotate-module`.

Run `bun generate` after modifying the schema to regenerate derived types and registries.
