# Feature Plan: color-sampler

## Dependency Graph

```
Task 01: define-node (all schema changes)
    ├── Task 02: control-node (colorSamplerMode selector) ──────────────────┐
    ├── Task 03: compute-node (valueSampler)                                 │
    └── Task 04: compute-node (colorSampler) ──────────────────────┐        │
         ├── Task 05: compute-node (orbit — add colorSampler input) ─┐      │
         └── Task 06: compute-node (pointsOnALine — add colorSampler) ┤     │
                                                                      └─ Task 07: algorithm
```

Tasks 02, 03, 04 can run in parallel after Task 01.
Tasks 05, 06 can run in parallel after Task 04.
Task 07 requires Tasks 02, 05, 06 complete.

## Task List

| # | File | Skill | Depends on |
|---|---|---|---|
| 01 | task_01_define-node_schema.md | `define-node` | — |
| 02 | task_02_control-node_color-sampler-mode-selector.md | `control-node` | 01 |
| 03 | task_03_compute-node_value-sampler.md | `compute-node` | 01 |
| 04 | task_04_compute-node_color-sampler.md | `compute-node` | 01 |
| 05 | task_05_compute-node_orbit-color-sampler.md | `compute-node` | 04 |
| 06 | task_06_compute-node_points-on-a-line-color-sampler.md | `compute-node` | 04 |
| 07 | task_07_algorithm_color-sampler-demo.md | `algorithm` | 02, 05, 06 |
