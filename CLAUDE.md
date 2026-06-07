


# Geometric Art Engine

This project is a generative art engine. Graphs of connected nodes are evaluated each frame to produce animations drawn to a canvas.

## Tooling

Use `bun` to execute node-like commands.

`bun test fileName` to run tests on a single file.

Use `bun typecheck` for typing the entire project.

After making a series of changes run `bun validate` to run all tests and static checks.

Use `bun generate` to run all code generation scripts.


## Language

Always use British English, with the exception of the following words:

- color
- center


## Agent Instructions

- Some prompts might request or encourage feedback. This can be left in `project/feedback`. This is an exception to any file scope restrictions.

- Some .md files may contain lines with a 🖊️ emoji. You can ignore these unless you are the `md-file-agent`.

- Be very concise in creating .md files, commit messages, etc.

- If you ask a question and it doesn't get an answer — re-ask the question.


## Canonical Levels

Some files will have a `CANONICAL LEVEL` header at the top. This gives an indication of how seriously the code in that file should be treated.

Example:

```
/**
 * CANONICAL LEVEL: 🧪 - 2026-05-14
 */
```

The levels are:

👑 — Gold standard. Use this as a template for similar work and freely depend on the code, respecting regular module boundaries.

🥈 — Mostly good but with some questionable areas.

🗑️ — Intended to be replaced. Do not use as an example of how to do things.

🧪 — Experimental. Working when committed but may contain bugs or patterns that should not be repeated. If relying on this code, prompt the user for clarification before proceeding. Ask the user if they want you to add a matching canonical header to any file you write.

The canonical header also contains a `YYYY-MM-DD` date — a more recent 👑 header takes precedence over an older one.


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


---
canon: CANONICAL STATUS 👑 - 2026-06-06
---

## Committing Philosophy

- Commit after each task completes.
- Commit after each workflow phase completes.
- Commit at stable checkpoints within a task — working state, tests passing.
- Do not batch commits across tasks or phases.
- Reference the task or phase name in the commit message.


