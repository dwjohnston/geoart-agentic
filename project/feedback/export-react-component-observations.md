# Export React component — implementation notes

## CLAUDE.md is gitignored and wasn't materialised in this worktree

The worktree for this task had no `CLAUDE.md` at the repo root at all (it's
`.gitignore`'d and generated — presumably by `bun generate:agents`, which requires an
`<approach>` argument that wasn't documented anywhere I found). The calling agent's
"read CLAUDE.md at repo root" instruction was satisfied only because its contents had
already been supplied verbatim via the system prompt from a *different* worktree/checkout.
A fresh worktree with no system-prompt copy of CLAUDE.md would have nothing to read.
Worth either committing a minimal root CLAUDE.md, or documenting the exact
`generate:agents` invocation needed to materialise it in a new worktree.

## `graphEngineExports` boundary zone can't import `algorithms`

`eslint.config.ts`'s `import/no-restricted-paths` zones don't let
`src/graphEngine/exports/**` import from `src/algorithms/**` (only `application` and
`algorithms` itself are allowed to import `algorithms`). Test files living in
`src/graphEngine/exports/` (e.g. for a new embeddable component) therefore can't reuse
the existing reference graphs as fixtures — an inline `GeoArtGraph` literal is needed
instead. Not a bug, just non-obvious until you hit the lint error.
