# Prompt issue: wrong test command for browser tests

## Problem

Task files for browser components instructed agents to verify with `bun test <filename>`. This command runs bun's built-in test runner, which does not execute `.browser.test.tsx` files — those require vitest via `bun test:browser:headless`. Agents reported "tests pass" without actually running the browser tests.

## Fix

Task file prompts for components with `.browser.test.tsx` files should say:

> Run `bun test:browser:headless` to verify browser tests pass.
> Run `bun typecheck` to verify types.

Alternatively, note the distinction upfront: "This project has two test runners. Unit tests: `bun test`. Browser tests (`.browser.test.tsx`): `bun test:browser:headless`."
