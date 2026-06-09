# Feature Plan: Wave Module

## Dependency Graph

```
task_01_define-node  →  task_02_module-node  →  task_03_algorithm
```

All tasks are sequential. Each depends on the prior.

## Task List

| # | Skill | Task | Depends on |
|---|---|---|---|
| 01 | `define-node` | Define wave module in schema | — |
| 02 | `module-node` | Implement wave module | 01 |
| 03 | `algorithm` | Write reference algorithm | 02 |

## Task Files

- `task_01_define-node_wave-module-schema.md`
- `task_02_module-node_wave-module-impl.md`
- `task_03_algorithm_wave-module-reference.md`
