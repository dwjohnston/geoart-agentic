# workflow-plan: no guidance when *no* skill in the index applies at all

`workflow-plan`'s instruction is: "If a task requires a skill that does not exist,
stop and inform the user. Do not create a generic task file as a workaround." This
covers the case of one task in an otherwise skill-shaped feature. It doesn't cover
the case where the *entire* feature (e.g. "add wrangler.jsonc and SSR tooling") is
general infrastructure/tooling work with no corresponding skill anywhere in the index
— the project's skill index is entirely node/algorithm/workflow-development shaped
(`define-node`, `compute-node`, `render-node`, `control-node`, `module-node`,
`algorithm`, `node-ideate`), with nothing for build tooling, deployment config, or
other non-node engineering work.

This required stopping mid-Phase-2 and asking the user how to proceed (they chose
"implement directly, outside the task-file system"). Suggest either:

- Adding a generic `implement` skill to the index for exactly this case, so
  Phase 2 has a documented, deterministic path instead of an ad hoc user prompt
  each time; or
- Adding an explicit line to `workflow-plan`'s instructions covering "no skill in
  the index applies to this feature at all" as its own case, with a prescribed
  default (e.g. "implement directly and note it in FEATURE_PLAN.md") rather than
  leaving it to be inferred from the single-task wording.

## Addendum (issue #140, headless run)

Hit the narrower version of this: one task in an otherwise skill-shaped feature
had no matching skill (cross-cutting UI/engine plumbing touching
`src/graphEngine/*` and `src/ui`, which `module-node`'s file scope excludes).
Headless mode has no user to ask, so I applied suggestion #2 above by default:
documented the gap in `FEATURE_PLAN.md`, implemented that one task directly as
the orchestrating agent, and delegated only the in-scope remainder to
`module-node`. This worked cleanly and didn't block the run. Formalising
suggestion #2 into the skill text would remove the need to reason this out
each time, and matters more in headless mode where there's no one to ask.
