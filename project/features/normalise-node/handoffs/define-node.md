# define-node handoff: normalise

**Kind:** compute
**Type:** `normalise`
**Schema name:** `NormaliseNode`
**Description:** Fits an array of input points into a bounding box centered on one or more normalisation centers, oriented toward one or more normalisation origins, using product cardinality.

## Inputs
| Port | Type |
|---|---|
| `inputPoints` | `colorPointArrayValueOrRef` |
| `normalisationCenters` | `colorPointArrayValueOrRef` |
| `normalisationOrigin` | `colorPointArrayValueOrRef` |
| `normalisationSize` | `numberValueOrRef` |
| `strength` | `numberValueOrRef` |

## Outputs
| Port | Type |
|---|---|
| `points` | `colorPointArrayValue` |

## Behaviour

See `project/features/normalise-node/task_02_compute-node_normalise-node.md` for the full spec used by the compute-node implementation.

## Notes

- No new value types were introduced; reuses existing `colorPointArrayValueOrRef` / `numberValueOrRef` / `colorPointArrayValue` from `refable-value-kinds.schema.json` / `value-kinds.schema.json`.
- Added between the existing `Rotate Compute Node` and `Value Sampler Compute Node` entries in `src/schema/schema/schema.json`, following the same `Reflect`/`Rotate` pattern (title ending in "Compute Node", `x-outputs`, `additionalProperties: false`, params as `refable-value-kinds.schema.json` refs).
- The field is named `normalisationOrigin` (singular) even though it holds an array, matching the name specified in the originating issue verbatim.
- This environment could not run `bun generate` (no dependencies installed, `bun install`/`bun generate` require approval unavailable in this headless run) — the schema change should be picked up automatically the next time `bun generate` runs, since node registries are derived by scanning `src/nodes/compute/nodes/` and the schema file, with no other manual registration step required.
