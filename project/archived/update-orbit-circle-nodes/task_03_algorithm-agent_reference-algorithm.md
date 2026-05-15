# Task 03 — Algorithm: Reference Algorithm for Multi-Centre Orbit

**Agent:** algorithm-agent
**Status:** TODO
**Depends on:** Task 02 (implementation must be complete first)

## Goal

Create a minimal reference algorithm that demonstrates the `centerPoints` input on the `orbit` compute node.

## Location

`src/algorithms/reference/node_specific/` — follow the naming convention used by existing files in that folder.

## Algorithm Requirements

- Use the `orbit` node with a `centerPoints` input containing at least 2 static colour points (e.g. one red, one blue)
- Set `numPoints` to 2 or more so the multi-orbit flattening is clearly exercised
- Wire the `points` output to an appropriate render node (e.g. `circle` or `connect-dots`) so the algorithm is visually meaningful
- Include a `time` node wired to the orbit's `time` input so the animation runs
- Export a single named export (follow the pattern of existing reference algorithms in that folder)
- Keep it minimal — this is a reference/snapshot test algorithm, not a showcase

## Acceptance Criteria

- Algorithm validates and compiles without errors (`bun run test:headless --run` passes)
- Snapshot test is automatically picked up by the test suite
- The algorithm clearly exercises `centerPoints` with multiple centres
