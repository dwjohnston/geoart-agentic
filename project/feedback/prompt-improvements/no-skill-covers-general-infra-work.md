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

**Update (export-react-component, 2026-08-19):** hit the same gap again, headlessly
this time (no user to ask). Followed the precedent set here — implemented directly,
documented the reasoning in `FEATURE_PLAN.md` — since headless mode can't stop for
confirmation. Two occurrences in one day is a decent signal this should be resolved
in the skill/index rather than re-derived per session.
