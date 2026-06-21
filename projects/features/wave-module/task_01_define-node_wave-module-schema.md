# Task 01 — define-node: Wave Module Schema

Use the `define-node` skill.

## Goal

Define the `wave` module node in the schema.

## Node details

**Type:** module node  
**Name:** `wave`

### Socket inputs

| Name | Value type | Description |
|---|---|---|
| `frequency` | number | Primary oscillator frequency |
| `amplitude` | number | Primary oscillator amplitude |
| `phase` | number | Primary oscillator phase offset |

### Outputs

| Name | Value type | Description |
|---|---|---|
| `value` | number | Current wave value at time t |
| `sampler` | sampler | Callable for use with `curveModulator` |

## Handoff

Write the schema definition (node type name, input/output port names and value types) to `projects/features/wave-module/handoffs/task_01_schema.md` for the module-node skill to consume.
