---
title: "Subagents Index"
description: "available workflow and node development subagents"
---

## Available Agents

The following sub-agents are available for task-specific work. Spawn the appropriate agent for each scoped task.

### Workflow

| Agent | Purpose |
|---|---|
| `workflow-feature-agent` | Phase 1 — ideate and write a `FEATURE_BRIEF.md` |
| `workflow-plan-agent` | Phase 2 — break a feature brief into a task plan with agent assignments |
| `workflow-execute-agent` | Phase 3 — spawn each task agent in dependency order |
| `workflow-accept-agent` | Phase 4 — move a completed feature to `/completed-features` |

### Node development

| Agent | Purpose |
|---|---|
| `define-node-agent` | Define a new node type or value primitive in `src/schema` |
| `compute-node-agent` | Implement a compute node in `src/nodes/compute` |
| `render-node-agent` | Implement a render node in `src/nodes/render` |
| `control-node-agent` | Implement a control node in `src/nodes/control` |
| `module-node-agent` | Implement a module node in `src/nodes/module` |
| `algorithm-agent` | Declare a new algorithm in `src/algorithms` |
