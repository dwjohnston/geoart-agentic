# Offline instructions — fleshed out (review pass)

Reviewed against the codebase, project docs, and GitHub issues/PRs. Flagging overlaps with existing tracked work so you can correct before I go further.

## Clean up

- **Unused/deprecated schema fields**: Real cleanup target — `schema.json` has explicit `deprecated`/`x-deprecated` fields (e.g. `center`/`color` on colorPoint nodes, `timedLine`, `pointsOnALine`) kept only for back-compat. Plan: delete the field + migrate/delete any reference algorithm still using it.
- **Reference algorithm tidy-up**: `src/algorithms/reference/` has 264 files across folders like `davids_playground`, `general`, `canonical`, `node_specific` — clearly a mix of curated and scratch. Need to audit which nodes have zero reference coverage, and prune the boring/junk ones.
- Grouping: currently organized by loose folder names, not obviously by node-category or "interesting-ness" — will need a real taxonomy.

## UX Polish

- **All modules documented**: 8 module nodes exist (`src/nodes/module/nodes/*`) — need to check each has proper `description`/docs, matching issue #93 (generate node reference markdown from schema).
- **Render controls → module control**: Modules already have a `renderControl` hook (`moduleUtils.ts`) used per-module for custom UI — pulling the render/visibility toggle in there is plausible, but per-module toggle vs. "toggle all of a type" (currently handled generically in `RenderToggles.tsx` via layer) needs a concrete design.
- **Module nodes in graph view**: Confirmed gap — `GraphView.tsx` currently has no module-node handling at all (matches issue #23, closed, "static graph visualisation view" — it only covers non-module nodes).
- Graph description + page title ("Geoart 3000"): pure UI additions, no blockers found.

### Mobile

- First pass (display-only) and second pass (mobile controls) both match nothing existing — currently no responsive handling in `Controls.tsx`/`App.tsx`. Straightforward scoping, no surprises.

## TypeScript builder

- Matches open PR #120 "Ideate builder 2" (1007 additions, still open) — worth checking if that PR already explores Monaco/TS-authoring before starting fresh.
- Sharing-mechanism interaction + eval security concern are real: current JSON import/export (`ImportAlgorithmModal.tsx`) trusts a schema-validated object, not arbitrary code — a TS-authoring path needs a compile/sandbox step (e.g. sandboxed iframe/worker), not `eval`.
- Keeping JSON import/export alongside — no conflict, they're separate paths already.

## Very nice to have

- **Meta schema**: relates to issue #51 (embedding AI instructions in JSON schema vs. markdown) — that's a research question, not an implementation, worth resolving first.
- **Algorithm preview in PRs**: matches open issue #42 exactly (before/after render images posted to PR via `renderSnapshotToFile.ts`) — this is a scoped, already-written spec, just needs building.

## Social shares and SSR

- SSR render for social-share images/GIFs and compute-abuse/max-render-time guardrails are captured in roadmap issue #129 ("Export formats: image/video/GIF") but that issue doesn't mention the SSR/Cloudflare-edge-timeout angle — worth adding that detail to #129 or a new issue.

## Miscellaneous

- **Export React components**: also explicitly listed in issue #129 ("Export react component"). Same item, not new.

## Deploy

- Matches issue #129's first task ("Get the application deployed somewhere — no target platform decided yet"). You mention Cloudflare here specifically — that decision isn't recorded in #129 yet.

## Observability

- No existing tracking or code for this (no logging/metrics libs in `package.json`). Suggest starting minimal: basic error boundary + console-level perf markers, not a vendor integration, given this is a deploy-and-shelve pass.

## Open question

Several items (deploy, export formats, react component export) are already sub-tasks of issue #129, and #42/#26/#93 cover others individually. Decide: treat #129 as the parent tracking issue and file/update the rest as sub-issues before touching code, or work straight off `offline_instructions.md` instead.
