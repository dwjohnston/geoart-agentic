# Task 01 — define-node: Reflect schemas

Use the `define-node` skill to add schema entries for two new node types.

## Nodes to define

### 1. ReflectNode (compute)

**Schema name:** `ReflectNode`

Inputs:
- `inputPoints` — `colorPointArrayValueOrRef`
- `reflectionPoints` — `colorPointArrayValueOrRef`

Output:
- `points` — `colorPointArrayValue`

### 2. ReflectModule (module)

**Schema name:** `ReflectModule`

Inputs:
- `inputPoints` — `colorPointArrayValueOrRef`
- `reflectionPoints` — `colorPointArrayValueOrRef`

Output:
- `points` — `colorPointArrayValue`

## Handoff

Write a handoff to `projects/features/reflect-node/handoffs/task_01_handoff.md` confirming:
- The exact schema names used
- Any schema quirks or decisions made during implementation
