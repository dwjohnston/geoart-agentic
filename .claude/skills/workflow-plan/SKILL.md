---
name: workflow-plan
description: Phase 2 — break a feature brief into a task plan with skill assignments.
---

You are running Phase 2 of the workflow: planning.

--- 
canon: CANONICAL STATUS 👑 - 2026-06-06
---

## Workflow

### Projects folder

```
/projects
   /completed-features  - features move here when done
   /features
      /[feature name]
         FEATURE_BRIEF.md
         FEATURE_PLAN.md
         task_xx_skill_name_task_name.md
         /handoffs        - artefacts passed between skills

   /feedback            - skills can leave notes here
   /human               - human-only notes area
```

### Workflow Phases

---

#### Phase 1 — `/workflow-feature`

**HITL:** Conversational ideation. Ask clarifying questions, suggest alternatives, flag potential problems. This is not a jump-straight-into-action phase.

Ask for a feature name at the start. If a folder for this feature already exists in `projects/features`, tell the user.

Output: `FEATURE_BRIEF.md` in `projects/features/[feature name]/`.

**Headless:** The GitHub issue body *is* the brief. Copy it verbatim into `FEATURE_BRIEF.md` and proceed directly to Phase 2.

---

#### Phase 2 — `/workflow-plan`

Read the `FEATURE_BRIEF.md`. This phase should not require reading project files beyond that.

Produce a `FEATURE_PLAN.md` containing:

- A dependency graph showing which tasks can be parallelised and which depend on prior tasks (informational — in headless mode tasks run sequentially; in HITL the human may run independent tasks in parallel sessions)
- An ordered task list, each entry mapping to a named skill from the skills index
- One task file per task: `task_xx_skill_name_task_name.md`, containing the prompt for that skill invocation

If a task requires a skill that does not exist, **stop and inform the user**. Do not create a generic task file as a workaround.

---

#### Phase 3 — `/workflow-execute`

Invoke each task's skill in dependency order, reading its task file for the prompt.

Skills that feed into each other hand off via written artefacts at `projects/features/[feature name]/handoffs/`. See [agent_prompt_experiments.md](agent_prompt_experiments.md) for the handoff pattern.

Commit after each task completes. Commit at stable checkpoints within a task. See [committing_philosophy.md](committing_philosophy.md).

**HITL:** Before invoking each task, prompt the user: "Run [task name] now?" The user may skip or defer individual tasks.

**Headless:** Run all tasks sequentially without prompting.

---

#### Phase 4 — `/workflow-accept`

**HITL:** Propose moving the feature folder from `projects/features/` to `projects/completed-features/`. Wait for confirmation before proceeding.

**Headless:** Move the folder automatically.

No commit step — commits have already been made throughout execution.


## Available Skills

The following skills are available for task-specific work. Invoke the appropriate skill before starting a scoped task.

### Workflow

| Skill | Purpose |
|---|---|
| `workflow-feature` | Phase 1 — ideate and write a `FEATURE_BRIEF.md` |
| `workflow-plan` | Phase 2 — break a feature brief into a task plan with skill assignments |
| `workflow-execute` | Phase 3 — invoke each task skill in dependency order |
| `workflow-accept` | Phase 4 — move a completed feature to `projects/completed-features` |
| `workflow-auto` | Headless orchestrator — runs all four phases in sequence (GitHub integration) |

### Node development

| Skill | Purpose |
|---|---|
| `define-node` | Define a new node type or value primitive in `src/schema` |
| `compute-node` | Implement a compute node in `src/nodes/compute` |
| `render-node` | Implement a render node in `src/nodes/render` |
| `control-node` | Implement a control node in `src/nodes/control` |
| `module-node` | Implement a module node in `src/nodes/module` |
| `algorithm` | Declare a new algorithm in `src/algorithms` |

