# Task 01 — define-node: NormaliseNode

Use the `define-node` skill to add a schema entry for a new node type.

## Node to define

### NormaliseNode (compute)

**Schema name:** `NormaliseNode`

Inputs:
- `inputPoints` — `colorPointArrayValueOrRef`
- `normalisationCenters` — `colorPointArrayValueOrRef`
- `normalisationOrigin` — `colorPointArrayValueOrRef`
- `normalisationSize` — `numberValueOrRef`
- `strength` — `numberValueOrRef`

Output:
- `points` — `colorPointArrayValue`

## Handoff

Write a handoff to `project/features/normalise-node/handoffs/define-node.md` confirming:
- The exact schema name used
- Any schema quirks or decisions made during implementation
