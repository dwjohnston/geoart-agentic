# Prompt improvement: module-node skill must add schema entry itself

**Session:** rotate-node, 2026-06-14

## Problem

The `define-node` task only added the `rotate` compute node to the schema. When `module-node` ran, `rotate-module` was not in the schema — the skill had to detect this and add it before implementing.

The `module-node` skill prompt says "Read from `src/schema` only" and "Write only to `src/nodes/module`" — this file scope rule is wrong when the module schema entry hasn't been added yet.

## Suggested fix

Add a note to the `module-node` skill:

> **Schema check:** Before implementing, verify that the module type (e.g. `rotate-module`) is already defined under `definitions.moduleNode` in `src/schema/schema/schema.json`. If it is missing, add it now — follow the `reflect-module` entry as a template. Run `bun generate` after adding it.

Alternatively, add a `define-module` step to the workflow plan template so the module schema entry is always a separate task.
