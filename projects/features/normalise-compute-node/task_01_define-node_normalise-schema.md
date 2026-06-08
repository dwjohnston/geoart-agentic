# Task 01: Define Normalise Node Schema

## Skill: `define-node`

## Prompt

Define the schema for a new compute node called `normalise` (or `NormaliseNode` / similar naming convention used in the project).

### Inputs

| Port | Type |
|---|---|
| `inputPoints` | `colorPointArrayValueOrRef` |
| `normalisationCenters` | `colorPointArrayValueOrRef` |
| `normalisationSize` | `numberValueOrRef` |
| `strength` | `numberValueOrRef` |
| `mode` | enum: `"product"` \| `"sequential"` (default `"product"`) |

### Output

| Port | Type |
|---|---|
| `points` | `colorPointArrayValue` |

### Notes

- `mode` is an enum input. Define it as a new enum type if one does not already exist.
- `strength` has a meaningful default of `0` (identity — output equals input).
- `mode` has a default of `"product"`.
- Follow the existing naming and structural conventions used for other compute nodes in the schema.

Deliver: updated schema files and any generated artefacts (`bun generate`).
