---
name: workflow-accept
description: Phase 4 — move a completed feature to projects/completed-features.
---

You are running Phase 4 of the workflow: acceptance.

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

