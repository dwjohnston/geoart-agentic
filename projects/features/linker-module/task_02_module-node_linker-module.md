# Task 02: Implement linker-module

## Skill: `module-node`

Implement a module node called `linker-module` that wraps the `timedLineArray` render node.

## Dependencies

Read the handoff at `projects/features/linker-module/handoffs/define-node.md` for the schema entry and port types.

## Details

- The module kind is `linker-module`
- It wraps the `timedLineArray` render node
- `pointsFrom` and `pointsTo` are **connectable ports** (not controls) — they are the module's input ports
- All other `timedLineArray` inputs are exposed as **controls** inside the module

## Handoff

Write a handoff to `projects/features/linker-module/handoffs/module-node.md` documenting:
- The module node kind name
- The names of the connectable input ports
- The names of the control ports (with their types)
