# Feature Plan: Reflect & Rotate Color Effects

## Dependency Graph

```
task_01_define-node_schema-changes
        ↓
task_02_compute-node_reflect-rotate-color-shift
        ↓
task_03_module-node_reflect-rotate-module-color-shift
        ↓
task_04_algorithm_reflect-rotate-color-effects
```

All tasks are sequential — each depends on the previous.

## Task List

| # | Skill | Task |
|---|---|---|
| 01 | `define-node` | Add `colorShiftOperationEnumValue` type and `colorShiftOperation` param to schema |
| 02 | `compute-node` | Implement color shift logic in `reflect` and `rotate` compute nodes |
| 03 | `module-node` | Wire `colorShiftOperation` through `reflect-module` and `rotate-module`, expose via renderControl |
| 04 | `algorithm` | Reference algorithm demonstrating `colorShiftOperation` |
