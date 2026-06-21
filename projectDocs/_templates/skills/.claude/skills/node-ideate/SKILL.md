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

<!-- include: projectDocs/skill-fragments/skill_feature_name.md -->

<!-- include: projectDocs/node-development/node_ideation.md -->
