# 1. Composed prompt files from fragments

Date: 2026-06-05
Status: Accepted

## Context

Project instructions for agents are spread across a 489-line root `CLAUDE.md`,
ten nested `CLAUDE.md` files (mostly empty), thin `.claude/agents/*` files, and a
rich `projectDocs/` set. The root `CLAUDE.md` duplicates large parts of
`terminology.md`, `conceptual_architecture.md`, and the node-anatomy docs, and
drifts against them.

We also want to **experiment with different prompt structures** — to compose the
same underlying knowledge into different combinations of `CLAUDE.md` / agent /
skill files and compare them — without editing files by hand each time.

## Decision

Compose all on-disk prompt files from a single fragment pool via a script.

- **Single source of truth.** `projectDocs/*.md` (outside `templates/`) are
  authored as terse, single-purpose **fragments**. No knowledge is duplicated.
- **Templates compose fragments.** `<!-- include: file.md#section -->` splices a
  fragment (section-level) into a template; the template owns one-off prose
  inline. The script hard-fails on a missing file or anchor.
- **`templates/<approach>/` mirrors the repo root.** A template's path *is* its
  output path — uniform across root `CLAUDE.md`, nested `CLAUDE.md`, agents, and
  skills. Fragments never live under `templates/`.
- **Multiple approaches.** `bun generate-agent-files <approach>` composes one
  approach. Approaches share the one fragment pool and differ **only** in
  composition, so a comparison changes a single variable.
- **Template reuse.** `<!-- template: ... -->` makes a file a whole-file copy of
  another approach's template (whole-file XOR bespoke, never mixed). Bare name =
  same relative path in that approach; slash = explicit path. Transitive,
  hard-fails on cycle or missing target.
- **File handling.** `.md` files are expanded and written; non-`.md` assets are
  copied verbatim (so asset-bearing skills compose).
- **Outputs are gitignored**, ephemeral per-experiment artifacts. Cleanup before
  each run is brute-force over the output locations. Generation is manual.

## Consequences

- The root `CLAUDE.md` and all nested ones, agents, and skills become
  **generated, untracked** files. *All* hand-authored versions move into
  `templates/`, so nothing bespoke sits in the output locations — which is what
  makes brute-force cleanup safe.
- A fresh `git clone` has **no** prompt files until `bun generate-agent-files`
  runs; the first session before generation runs unconfigured, and the failure
  is silent. Documented as a one-line bootstrap step in the README.
- Prompt files are invisible on GitHub web and to PR reviewers who don't run the
  generator.
- Drift between fragments and the committed CLAUDE.md is eliminated by removing
  the committed CLAUDE.md entirely.

## Alternatives considered

- **Commit the outputs + a `--check` drift gate.** Safer bootstrap and visible
  on GitHub, but the outputs are per-experiment and would churn git constantly;
  rejected because they are ephemeral by nature.
- **Per-approach fragment copies.** Lets approaches reword content, but changes
  two variables at once and reintroduces the duplication this refactor removes.
- **Manifest-driven cleanup / banner-driven cleanup.** Surgical deletion that
  protects bespoke files, but unnecessary once all hand-authored files are
  templates. May be revisited if bespoke files are reintroduced.
- **Auto-regeneration on `prepare`/`post-merge`/`post-checkout`.** Would clobber
  the approach under test on a `git pull`; rejected in favour of manual runs.
