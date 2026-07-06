# workflow-plan stops when task is pure UI work

## Problem

`workflow-plan` requires every task to map to a named skill. When a feature is pure UI/React implementation (no node types, no algorithms), none of the available skills apply and the phase halts with:

> "If a task requires a skill that does not exist, stop and inform the user."

This is correct behaviour, but it leaves the user without a path forward for common feature work.

## What happened

The export-and-share feature (Share button, Export JSON modal, URL loading) was entirely UI work. workflow-plan correctly stopped and the feature was implemented directly outside the workflow system.

## Suggested improvement

Either:

1. Add a `ui-feature` skill (or similar) that handles React/TypeScript UI implementation tasks — analogous to `compute-node` for node work.

2. Or, document in workflow-plan that "direct implementation" is the intended path for UI-only features, and that workflow phases 2–4 should be skipped in that case. The feature brief and bug fix notes can still be committed as project artefacts.
