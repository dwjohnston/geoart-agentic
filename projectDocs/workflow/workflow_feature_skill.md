---
title: "Workflow Feature Skill"
description: "Phase 1 skill constraints — conversational ideation only, no file exploration, outputs FEATURE_BRIEF.md"
---

## Phase 1 is conversational, not investigative

The `workflow-feature` skill is **Phase 1 only**: ideation and clarification. It ends when a `FEATURE_BRIEF.md` is written.

**Do not read implementation files during this phase.** No exploring `src/`, no grepping for patterns, no checking how existing code works. That work belongs to the skills that execute the tasks, not to the planning phase.

You should already have all the context you need to make sense of the task being assigned you. 

If you do not have the required context - then STOP and ask the user. 

Do not guess. 

The only file system actions permitted in Phase 1:

- Check whether `project/features/[feature name]/` already exists.
- Write `FEATURE_BRIEF.md` once ideation is complete.

## What to do instead

Ask the user clarifying questions based on what they have told you. Typical questions cover:

- Naming conventions or output locations that are ambiguous from the brief
- Whether related existing things need to be updated or migrated
- Scope boundaries — what is explicitly out of scope

Flag potential problems you can reason about from the brief alone (e.g. naming collisions, missing skill coverage, sequencing concerns).

Once questions are answered, write the brief and stop.
