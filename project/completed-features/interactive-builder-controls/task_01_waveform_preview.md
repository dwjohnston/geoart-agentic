# Task: WaveformPreview component

Create `src/common-ui/WaveformPreview.tsx` and `src/common-ui/WaveformPreview.browser.test.tsx`.

## What it does

A small SVG component that renders a wave signal as a line chart. Used inline in the wave registry panel and the wave binding picker.

## Props

```ts
type Props = {
  signalFn: (t: number) => number; // returns value in -1..1
  cycleLength: number;              // ticks per cycle
  width?: number;                   // default 80
  height?: number;                  // default 32
};
```

## Rendering

- Time window: always show `cycleLength * 2` ticks on the x-axis. This means:
  - Short cycle length → many cycles visible (dense)
  - Long cycle length → sparse (slow curve)
- Sample ~100 evenly spaced t values across the window.
- Map sampled values into SVG coordinates: t→x (0..width), signal→y (height/2 at 0, 0 at +1, height at -1).
- Draw as a single SVG `<polyline>` with no fill, stroke color `currentColor`.
- Include a horizontal midline at y=height/2 in a muted color.
- No axes, no labels — just the waveform.

## Tests

Use `vitest-browser-react`. Import from `@vitest/browser/page` for `page`.

Test cases:
1. Renders an SVG element.
2. Renders a polyline with points attribute.
3. A flat signal (always 0) produces a polyline where all y values are at the midpoint (height/2).

## Reference patterns

See `src/nodes/control/ui/SliderControl.browser.test.tsx` for the test pattern.
See `src/nodes/control/ui/ColorPickerControl.tsx` for the component pattern.

Run `bun test WaveformPreview` to verify. Run `bun typecheck` to check types.
