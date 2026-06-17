# Task 03 — control-node: Expose `linearTotal` in the CycleLengthMode dropdown

## Goal

Add `'linearTotal'` to the dropdown options in `src/nodes/control/nodes/CycleLengthModeDropdown.tsx`.

## Change

```ts
// Before
const CYCLE_LENGTH_MODES = ['arrayLength', 'linearOne'] as const;

// After
const CYCLE_LENGTH_MODES = ['arrayLength', 'linearOne', 'linearTotal'] as const;
```

No other changes needed — the control node does not need to know mode semantics.

## Validation

Run `bun test CycleLengthModeDropdown` — existing tests must still pass.
Run `bun typecheck`.
