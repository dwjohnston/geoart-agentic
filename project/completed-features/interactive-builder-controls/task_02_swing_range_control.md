# Task: SwingRangeControl component

Create `src/common-ui/SwingRangeControl.tsx` and `src/common-ui/SwingRangeControl.browser.test.tsx`.

## What it does

A control that exposes `min` and `max` numeric inputs plus a convenience "influence" slider that moves both values symmetrically around their midpoint. Used when a wave is bound to a parameter — the user sets the range the parameter swings between.

## Props

```ts
type Props = {
  min: number;
  max: number;
  step?: number;
  onChange: (value: { min: number; max: number }) => void;
};
```

## Behaviour

- Two `<input type="number">` fields (or KnobControl from `src/ui/KnobControl.tsx`) for `min` and `max`.
- An `<input type="range">` influence slider:
  - Range: 0 to 1.
  - At 1: `min` and `max` are at their original values.
  - At 0: `min` and `max` both equal the midpoint `(min + max) / 2`.
  - At values between: linearly interpolates each toward/away from the midpoint.
  - Moving the slider calls `onChange` with the new min/max.
- Editing `min` or `max` directly resets the influence slider to 1.
- Add `data-testid="swing-min"`, `data-testid="swing-max"`, `data-testid="swing-influence"`.

## Tests

Use `vitest-browser-react`. Import `page` from `@vitest/browser/page`.

Test cases:
1. Renders min and max inputs with initial values.
2. Renders an influence slider.
3. Changing min input calls onChange with updated min.
4. Changing max input calls onChange with updated max.
5. At influence=0, onChange is called with min === max === midpoint.

## Reference patterns

See `src/nodes/control/ui/SliderControl.browser.test.tsx` for the test pattern.
See `src/ui/KnobControl.tsx` if you want to use KnobControl for the numeric inputs (optional — plain `<input type="number">` is also fine).

Run `bun test SwingRangeControl` to verify. Run `bun typecheck` to check types.
