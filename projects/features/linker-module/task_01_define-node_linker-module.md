# Task 01: Define linker-module schema

## Skill: `define-node`

Define the `linker-module` module node in the schema.

## Details

- Node kind: `linker-module`
- It is a module node wrapping `timedLineArray`
- Connectable input ports: `pointsFrom`, `pointsTo`
- All other `timedLineArray` inputs are internal (exposed as controls, not external ports)

## Handoff

Write a handoff to `projects/features/linker-module/handoffs/define-node.md` documenting:
- The schema entry added
- The port names and value types for `pointsFrom` and `pointsTo`
