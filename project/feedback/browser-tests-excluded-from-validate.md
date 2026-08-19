# `bun validate` / `bun test` silently skip `*.browser.test.*` files

`bunfig.toml` sets `[test] pathIgnorePatterns = "**/*.browser.test.*"`, so `bun test`
(and therefore `bun validate`, and the pre-commit hook) never run files like
`App.browser.test.tsx`. Those only run via `bun test:browser` (real Chromium,
`npx vitest --browser=chromium`), which isn't part of `validate` or the commit hook.

Concretely: adding a new `test('...')` to `App.browser.test.tsx` and running
`bun validate` shows the same "600 pass" as before the addition — no signal that the
new test exists, let alone passes. Had to run `bunx vitest run --browser=chromium
<file>` manually to confirm it.

Worth flagging in CLAUDE.md's Tooling section or a projectDoc: UI-level assertions in
`.browser.test.tsx` files need an explicit manual `test:browser` run (or a CI step) —
`bun validate` passing is not evidence they pass, or even that they exist.
