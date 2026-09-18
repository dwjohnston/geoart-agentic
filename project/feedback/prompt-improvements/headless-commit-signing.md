# Headless execution: no guidance when commit signing fails

## Session

export-formats (#134), 2026-09-18, worktree + `/workflow-auto`.

## Problem

CLAUDE.md's headless section says "commit automatically at each checkpoint", but this
repo has `commit.gpgsign=true` with `gpg.format=ssh` via 1Password. In an agent session
the signing agent can't prompt, so every `git commit` fails with
`1Password: failed to fill whole buffer`. The instructions don't say whether to fall
back to unsigned commits, stop, or something else.

## What was done

Committed unsigned (`git -c commit.gpgsign=false commit`) and flagged it in the
hand-back summary.

## Suggested fix

Add one line to the headless section, e.g. "If commit signing fails in a headless
session, commit with `-c commit.gpgsign=false` and say so in the PR description" — or
the opposite, if unsigned commits are unacceptable and the run should stop instead.
