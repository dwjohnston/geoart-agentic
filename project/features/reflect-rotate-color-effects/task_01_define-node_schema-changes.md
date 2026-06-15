# Task 01 — define-node: Schema Changes

## Skill
`define-node`

## Context

Feature: Reflect & Rotate Color Effects
Feature brief: `project/features/reflect-rotate-color-effects/FEATURE_BRIEF.md`

## Task

Add the `colorShiftOperation` optional parameter to the schema for `reflect`, `rotate`, `reflect-module`, and `rotate-module` nodes.

### New value type

Define a new enum value type:

```
colorShiftOperationEnumValue
```

Values: `"none" | "blend" | "hue-shift" | "lighten" | "saturate"`

### Parameter changes

Add an optional `colorShiftOperation` parameter (of type `colorShiftOperationEnumValue`) to these four nodes:

- `reflect` (compute)
- `rotate` (compute)
- `reflect-module` (module)
- `rotate-module` (module)

Default when omitted: `"none"` (current behaviour — fully backward compatible).

### No new node types

**Do not** add a new control node type for the enum selector. The brief explicitly states no new node types. The module nodes will expose the parameter via their `renderControl` implementations (handled in a later task). The enum value type itself still needs defining, but its control node schema entry is out of scope.

## Handoff

Write `project/features/reflect-rotate-color-effects/handoffs/task_01_handoff.md` with:
- The exact name of the new enum value type
- The enum values
- Confirmation of which node schemas were updated
