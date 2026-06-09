# Feature Plan: Normalise Compute Node

## Dependency Graph

```
Task 01: define-node (no deps)
    └── Task 02: compute-node (depends on 01)
            └── Task 03: algorithm (depends on 01, 02)
```

All tasks are sequential.

## Task List

| # | Skill | Task |
|---|---|---|
| 01 | `define-node` | Define normalise node schema (node type + mode enum) |
| 02 | `compute-node` | Implement normalise compute node |
| 03 | `algorithm` | Declare normalise algorithm |
