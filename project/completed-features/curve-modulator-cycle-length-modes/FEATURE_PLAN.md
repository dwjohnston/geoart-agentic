# Feature Plan: curveModulator Cycle Length Modes

## Dependency Graph

```
task_01 (define-node) → task_02 (compute-node) → task_03 (control-node)
```

All tasks are sequential; task_02 and task_03 both depend on the regenerated types from task_01.

## Task List

| # | Skill | Task |
|---|---|---|
| 01 | `define-node` | Add `linearTotal` to `cycleLengthModeEnumValue` schema and regenerate |
| 02 | `compute-node` | Fix and implement all three cycle length modes |
| 03 | `control-node` | Expose `linearTotal` in the dropdown control |
