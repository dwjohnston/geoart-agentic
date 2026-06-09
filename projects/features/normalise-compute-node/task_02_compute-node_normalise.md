# Task 03: Implement Normalise Compute Node

## Skill: `compute-node`

## Prompt

Implement the `normalise` compute node. The schema has been defined (Task 01) and the reference algorithm declared (Task 02).

### Node behaviour

- Resolve all input ports from the schema-defined node type.
- Call the normalise algorithm (from `src/algorithms`) with the resolved inputs.
- Return the output as a `colorPointArrayValue`.

### Inputs (from schema)

| Port | Type |
|---|---|
| `inputPoints` | `colorPointArrayValueOrRef` |
| `normalisationCenters` | `colorPointArrayValueOrRef` |
| `normalisationSize` | `numberValueOrRef` |
| `strength` | `numberValueOrRef` (default `0`) |
| `mode` | `"product"` \| `"sequential"` (default `"product"`) |

### Output

| Port | Type |
|---|---|
| `points` | `colorPointArrayValue` |

### Requirements

- Output point colors inherit from corresponding input points.
- Normalisation center colors are ignored.
- Tests must cover: single center, multi-center product mode, sequential mode, `strength=0` identity, `strength=1` fully normalised, degenerate (empty or single-point) input.
- Follow conventions established by existing compute nodes.
