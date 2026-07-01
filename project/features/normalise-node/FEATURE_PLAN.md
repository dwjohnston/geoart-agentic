# Feature Plan: Normalise Node

## Dependency Graph

```
task_01 (define-node: NormaliseNode schema)
    ↓
task_02 (compute-node: NormaliseNode)
```

All tasks sequential — each depends on the prior.

## Task List

| # | Skill | Task | Depends on |
|---|---|---|---|
| 01 | `define-node` | Define NormaliseNode schema | — |
| 02 | `compute-node` | Implement NormaliseNode | 01 |

No new value types or enum types are introduced. No module node is in scope — the issue asks only for the compute node.
