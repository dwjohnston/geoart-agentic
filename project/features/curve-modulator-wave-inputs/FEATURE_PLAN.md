# Feature Plan: Curve Modulator Wave Inputs

## Dependency Graph

```
task_01_define-node  →  task_02_module-node
```

task_01 must complete before task_02 (schema generation produces types consumed by the module implementation).

## Tasks

| # | Skill | Description |
|---|---|---|
| 01 | `define-node` | Add wave params to curve-modulator-module schema and regenerate |
| 02 | `module-node` | Wire wave params through in the module implementation and add controls |
