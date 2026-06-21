---
name: node-ideate
description: Ideate a new or updated node type. Elicits and confirms test cases and a reference algorithm sketch, then writes them into the feature brief. Use when the task is 'create an X node' or before running workflow-feature for a node task.
---

You are running the node ideation phase.

## This phase is conversational, not investigative

Do not read implementation files. No exploring `src/`, no grepping for patterns, no checking existing code. That work belongs to the implementation skills.

The only file system actions permitted:
- Check whether `project/features/[feature name]/` already exists.
- Write `FEATURE_BRIEF.md` once ideation is complete.


## Feature name

Determine the feature name from your task context:
- If launched via the workflow, read it from the task file path (`project/features/[featureName]/task_...md`)
- If launched directly, ask the user



## Node Type Ideation

When the task involves adding or updating a node type, the feature brief must include two additional sections that downstream skills depend on.

Identify whether the task is node-related from the prompt (e.g. "add an X node", "create a compute node for Y", "update the Z node"). If it is, follow the steps below before writing the brief.

### 1. Test cases

Propose at least 2–3 concrete test cases. Each must include exact input values and expected output values. Use round numbers — the `/algorithm` skill reuses these values directly.

Example format for a hypothetical `multiply` node:

| Input | Expected output |
|---|---|
| `a: 3, b: 4` | `product: 12` |
| `a: 0, b: 5` | `product: 0` |
| `a: -2, b: 3` | `product: -6` |

Cover the typical case, a zero/identity case, and one edge case (e.g. negatives, empty input, maximum values).

You may suggest test cases based on the described behaviour. The user must confirm them before you write the brief.

### 2. Reference algorithm sketch

Propose a minimal algorithm that demonstrates the node producing visible output. Describe:
- Which other nodes it is wired to (e.g. `time`, `orbit`, a control slider)
- Sensible default parameter values for the node itself
- Whether it draws to the `paint` or `live` canvas layer, if relevant

You may draft the sketch in prose or pseudocode. The user must confirm it before you write the brief.

### Including these in the brief

Both the confirmed test cases and the reference algorithm sketch must appear verbatim in `FEATURE_BRIEF.md` under the headings:

- `## Test Cases`
- `## Reference Algorithm`

The downstream `/compute-node` and `/algorithm` skills read the brief and use these sections as their primary specification. If they are missing, those skills will have to guess — and will guess wrong.

