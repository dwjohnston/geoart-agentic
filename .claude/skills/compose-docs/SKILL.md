---
name: compose-docs
description: Author and maintain agent prompt fragments, skill templates, and CLAUDE.md files in the projectDocs composition system
---

# Agent Prompt Composition Experiments

## The Approach

Agent prompt files (CLAUDE.md, agent files, skill files) are generated from a single fragment pool rather than maintained by hand. Fragments live in `projectDocs/` as standalone `.md` files. Templates in `projectDocs/templates/<approach>/` compose fragments using `<!-- include: path -->` directives.

Running `bun generate-agent-files <approach>` writes the composed files to their output locations (committed to source control). Switching approaches is a single command. The fragment pool is shared — an approach experiment changes composition and structure, not the underlying knowledge.

> Previously these outputs were gitignored; they are now committed because the GitHub Actions integration requires the generated files to be present in the repository.

See [ADR 0001](adr/0001-composed-prompt-files.md) for the full technical decision.

---

## Philosophy

**Single source of truth via fragments.** Knowledge lives once in `projectDocs/` and is composed into wherever it's needed via `<!-- include: -->`. No content is duplicated inline across templates or skill files. When a fragment changes, all approaches and skills that include it update automatically.

**Thin skill files.** A SKILL.md contains only the envelope — frontmatter, role, file scope, responsibilities. All instructional depth (domain knowledge, test conventions, handoff instructions) lives as named fragments. This makes skills reusable across approaches and keeps each layer of abstraction at the right altitude.

**Explicit handoffs over implicit knowledge.** Skills that depend on each other communicate through written artefacts at `project/features/[featureName]/handoffs/`. Each skill writes what it knows; the next reads it before starting. Nothing is passed implicitly through shared context — this is what makes the workflow usable in headless mode where there is no human to bridge the gap.

---

## Fragment Pool and Skill Authoring

Skill SKILL.md files should be thin — frontmatter, role, file scope, and responsibilities only. All instructional content lives as fragments in `projectDocs/` and is pulled in via `<!-- include: -->` directives. This keeps skills reusable across approaches without duplication.

See [CLAUDE.md](CLAUDE.md) for authoring guidance when working in this directory.

---

## Terminology

**Composable doc (fragment):** A standalone `.md` file in `projectDocs/` that holds a self-contained piece of project knowledge. Fragments are the single source of truth — they are composed into agent prompt files via `<!-- include: -->` directives and never duplicated across templates or skill files.

**Template:** A file in `projectDocs/templates/<approach>/` that defines the structure of a generated output file (CLAUDE.md, skill file, or agent file) using `<!-- include: path -->` directives to splice fragments.

**Approach:** A named composition strategy under `projectDocs/templates/`. Each approach assembles the same fragment pool differently to test a different agent architecture hypothesis (e.g. `skills`, `default`, `local-claude-md`).

**Generated file:** The output of `bun generate-agent-files <approach>` — CLAUDE.md, skill files, and agent files written to their final locations. These files are committed to source control.

---

## Experiments

### `default` — Sub-agents

A monolithic root `CLAUDE.md` (all content inline) paired with `.claude/agents/*.md` files. The root agent has full project context and delegates scoped tasks to named sub-agents.

**Hypothesis:** Broad context enables better orchestration decisions but is expensive per-call and may cause context overload.

---

### `local-claude-md` — Directory-Scoped Context

A lightweight root `CLAUDE.md` (generic instructions via fragment includes) plus directory-specific CLAUDE.md files that Claude Code picks up automatically as the agent navigates the codebase.

- Root carries: tooling, language, agent instructions, canonical levels, project overview, terminology
- Local files carry: file scope restrictions, task-specific technical knowledge (node implementation guidelines, schema guidelines, algorithm conventions)

**Hypothesis:** Implicit context delivery reduces the root context size. The agent picks up exactly what it needs based on where it's working. Suited to tasks that are genuinely directory-bound.

---

### `skills` — Explicit Task Skills

A minimal root `CLAUDE.md` (tooling, language, agent instructions, canonical levels, skills index) with no domain knowledge. Context is carried by task-specific skill files that are invoked explicitly.

Each skill bundles:
- Role and file scope restrictions
- Relevant domain fragments via `<!-- include: -->`
- Reporting instructions (what to hand off when done)

**Hypothesis:** Lighter per-task context enables use of smaller models for scoped tasks. The skills index in the root CLAUDE.md guides the orchestrator on what to invoke.

#### Handoff Pattern

Skills that feed into each other use written artefacts at `project/features/[featureName]/handoffs/`. For example, the `compute-node` skill writes a handoff containing:
- Prose describing what the node does and what the test values demonstrate
- A partial algorithm skeleton using round-number test values

The `algorithm` skill reads this handoff and uses the skeleton as the basis for the reference algorithm, ensuring test values and algorithm values stay in sync.

#### Example: Introducing a New Node Type

Adding a new node type is a frequently occurring task. Issues [#52](https://github.com/david-johnston-org/geoart-agentic/issues/52) (pointsOnALineV2) and [#39](https://github.com/david-johnston-org/geoart-agentic/issues/39) (normalise) are representative examples of this issue shape.

It breaks into three tasks with a strict dependency chain:

```
/define-node  →  /compute-node (or /render-node, /control-node)  →  /algorithm
```

1. **`/define-node`** — adds the node type to `src/schema/schema/schema.json`, runs `bun generate`, writes a handoff with the schema definition and port types
2. **`/compute-node`** (or `/render-node`/`/control-node`) — implements the runtime logic in `src/nodes/[layer]/` including tests; reads the define-node handoff for port types and behaviour spec; writes a handoff with test values
3. **`/algorithm`** — writes a reference algorithm in `src/algorithms/reference/node_specific/` using round-number test values; reads the implementation handoff to keep test values and algorithm values in sync

In headless mode (`/workflow-auto`), the GitHub issue body is the feature brief. The workflow picks it up, plans these three tasks, and executes them sequentially without human ideation.

---

## Planned Experiment Variants

| Variant | Based on | Difference |
|---|---|---|
| `skills` | — | Skills index included in root CLAUDE.md |
| `skills-without-index` | `skills` | Skills index omitted — agent must know which skill to invoke |

The `skills-without-index` variant tests whether an explicit skill menu in the root is necessary, or whether the orchestrator can reason about which skill to use without it.

---
canon: CANONICAL STATUS 👑 - 2026-06-06
---

## Committing Philosophy

- Commit after each task completes.
- Commit after each workflow phase completes.
- Commit at stable checkpoints within a task — working state, tests passing.
- Do not batch commits across tasks or phases.
- Reference the task or phase name in the commit message.

