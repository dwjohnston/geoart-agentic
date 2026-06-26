# Prompt improvement: worktree base branch when working off a feature branch

## Session

points-on-a-line-v2-module workflow (2026-06-26)

## Problem

When instructed "use a git worktree, current branch adds feature X", `EnterWorktree` defaults to `fresh` (branches from `origin/main`). The feature work on the current branch was not present in the worktree, requiring an explicit `git merge` before any work could begin.

The user's intent was clearly to build on top of the existing branch, not on main.

## Suggested fix

When the user says "current branch has X, use a worktree", check the `worktree.baseRef` setting or note that `EnterWorktree` with `fresh` will not include the current branch's commits. Prefer merging from the named branch immediately after worktree creation, or consider whether `head` is a better base ref for this pattern.

Document the merge step explicitly in workflow-auto or the worktree guidance so it is not an implicit surprise.
