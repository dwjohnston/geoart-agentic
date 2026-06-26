# Feature Plan: Reflect Node

## Dependency Graph

```
task_01 (define-node: ReflectNode + ReflectModule schemas)
    ↓
task_02 (compute-node: ReflectNode)
    ↓
task_03 (module-node: ReflectModule)
```

All tasks sequential — each depends on the prior.

## Task List

| # | Skill | Task | Depends on |
|---|---|---|---|
| 01 | `define-node` | Define ReflectNode and ReflectModule schemas | — |
| 02 | `compute-node` | Implement ReflectNode | 01 |
| 03 | `module-node` | Implement ReflectModule | 01, 02 |

No new value types or enum types are introduced, so no additional control-node tasks are required.
No standalone render node — the reflection point visualisation lives inside ReflectModule only.
No reference algorithm is in scope.
