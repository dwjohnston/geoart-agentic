# Mobile render-only view — implementation notes

## `bun validate` does not run browser tests

`test:browser` / `test:browser:headless` (vitest-browser + Playwright chromium) are
separate `package.json` scripts, not included in `bun validate` (which runs `bun
test`, i.e. bun's own runner, plus typecheck/schema/lint-staged). `bunfig.toml` also
sets `[test].pathIgnorePatterns = "**/*.browser.test.*"`, so `bun test` explicitly
skips `*.browser.test.tsx` files. This task changed `App.tsx`/`Canvas.tsx`, which are
only covered by `*.browser.test.tsx` files — `bun validate` alone would not have
caught a regression there. Ran `bun run test:browser:headless` manually to verify.
Worth considering whether `bun validate` (or CI) should include browser tests.

## `page.viewport(width, height)` for responsive/breakpoint tests

`vitest-browser` (`page` from `vitest/browser`) exposes `page.viewport(width,
height): Promise<void>` for resizing the test iframe mid-test. Used this to add
desktop (1280x800) and mobile (390x844) viewport tests to `App.browser.test.tsx`
against a `matchMedia`-based `useIsMobile` hook, asserting on `data-testid`
(`desktop-view` / `mobile-view`) rather than pixel dimensions.

## Root `CLAUDE.md` is generated/gitignored, not committed

The repo's `.gitignore` excludes `CLAUDE.md` and `.claude/` — the file referenced by
task instructions as "checked into the codebase" is actually generated locally (via
the compose-md system in `projectDocs/`) and does not exist in `git show
origin/main:CLAUDE.md`. Headless agents should read it from the working directory
(it was present on disk) rather than assuming `git show`/`ls-files` will find it.
