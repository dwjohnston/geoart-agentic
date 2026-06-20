# Task 03 — module-node: Reflect & Rotate Module Color Shift

## Skill
`module-node`

## Context

Feature: Reflect & Rotate Color Effects
Feature brief: `project/features/reflect-rotate-color-effects/FEATURE_BRIEF.md`
Schema handoff: `project/features/reflect-rotate-color-effects/handoffs/task_01_handoff.md`
Compute handoff: `project/features/reflect-rotate-color-effects/handoffs/task_02_handoff.md`

## Task

Update **both** `reflect-module` and `rotate-module` to:

1. Accept the new `colorShiftOperation` parameter in their schema params and pass it through to the underlying `reflect` / `rotate` compute node.
2. Expose the parameter in their `renderControl` output via a hardcoded dropdown — **not** a registered control node type.

### renderControl Dropdown

The dropdown should let the user select one of:
- `none`
- `blend`
- `hue-shift`
- `lighten`
- `saturate`

Use the existing `renderControl` + `renderIfNeeded` pattern already in place for module nodes. Follow the pattern used by existing module controls in this codebase.

The label for the dropdown should be "Color Shift".

### Parameter pass-through

When the module builds its internal graph, `colorShiftOperation` must be forwarded to the compute node's params. When the value is `"none"` (or the param is absent), behaviour is identical to the current implementation.

### Backward compatibility

If `colorShiftOperation` is absent from the module's params, default to `"none"`.

## Shared domain helpers

The color math operations (blend, hue-shift, lighten, saturate, and the proximity-angle driver) are general-purpose functions that belong in domain helpers rather than living only inside the compute node implementations. If they are not already extracted there by task 02, extract them now so both the compute nodes and any future nodes can reuse them.
