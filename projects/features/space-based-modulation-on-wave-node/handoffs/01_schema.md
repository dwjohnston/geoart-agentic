# define-node handoff: wave node modulator params

## Status

Three new optional params were added to the `wave` compute node in `src/schema/schema/schema.json`.

## Params added

| Param name | Type |
|---|---|
| `frequencyModulator` | `samplerValueOrRef` |
| `amplitudeModulator` | `samplerValueOrRef` |
| `modulatorTemporalImpact` | `numberValueOrRef` |

## Notes

- All three params are optional (not added to `required`).
- `samplerValueOrRef` already existed in `refable-value-kinds.schema.json`; no new value types were needed.
- `bun generate` and `bun validate` both pass.
- The existing wave node implementation (`wave.ts`) and its tests (`wave.test.ts`) were updated to include the new ports in `defaults` and the test `base` fixture (with `null` defaults for the two sampler ports and `1` for `modulatorTemporalImpact`). The evaluate logic for these ports is left for the compute-node-agent.
