# CLAUDE.md: `bun validate` silently skips `.browser.test.tsx` files

CLAUDE.md says: "After making a series of changes run `bun validate` to run all tests
and static checks." In practice `bun validate` runs `bun test`, and `bunfig.toml` sets
`pathIgnorePatterns = "**/*.browser.test.*"` — so any React component test using
`vitest-browser-react` (e.g. `AlgorithmPicker.browser.test.tsx`) is invisible to
`bun validate` and only runs via `bun run test:browser:headless` (or in the separate
`browser-tests.yml` CI workflow on PRs to main).

An agent following CLAUDE.md's instruction literally could write and rely on a broken
browser test and still see `bun validate` pass. Suggest CLAUDE.md's Tooling section add
a line: "UI component tests live in `*.browser.test.tsx` and are NOT run by `bun test`
or `bun validate` — run `bun run test:browser:headless` separately after touching
`src/application` or `src/ui`."
