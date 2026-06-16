# Task 02: Implement colorSamplerMode Selector Control Node

Skill: `control-node`

## Context

Part of the color-sampler feature. The `colorSampler` compute node has a `mode` input typed as `colorSamplerModeEnumValue`. This task implements the dropdown selector control node that lets users set it from the UI.

## Read First

Read `project/features/color-sampler/handoffs/task_01_define-node.md` for the exact type names and enum values chosen in Task 01.

## What to implement

A dropdown selector control node for the `colorSamplerModeEnumValue` type. It should follow the same pattern as other enum selector control nodes in `src/nodes/control/`. The current enum values are: `clobber`.

The output port name is `mode`, typed as `colorSamplerModeEnumValue`.
