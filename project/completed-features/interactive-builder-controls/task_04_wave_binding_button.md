# Task: WaveBindingButton component

Create `src/common-ui/WaveBindingButton.tsx` and `src/common-ui/WaveBindingButton.browser.test.tsx`.

## Prerequisite

`src/common-ui/WaveformPreview.tsx` must already exist (Task T01). Import it from there.

## What it does

A per-parameter control that lets the user bind or unbind a wave from the registry. When unbound, it shows a "Bind wave" button. When bound, it shows the wave name and an inline WaveformPreview. Clicking opens a picker of all available waves.

## Props

```ts
type WaveOption = {
  id: string;
  name: string;
  signalFn: (t: number) => number;
  cycleLength: number;
};

type Props = {
  boundWaveId: string | null;
  availableWaves: WaveOption[];
  onBind: (waveId: string) => void;
  onUnbind: () => void;
};
```

## Behaviour

**Unbound state:**
- Shows a button labelled "Bind wave" (`data-testid="wave-bind-btn"`).
- Clicking opens the picker.

**Bound state:**
- Shows the bound wave's name and a `WaveformPreview` (width=60, height=24) for that wave.
- A small "×" button (`data-testid="wave-unbind-btn"`) calls `onUnbind()`.
- Clicking the name/preview area opens the picker.

**Picker:**
- An inline panel (`data-testid="wave-picker"`) listing all `availableWaves`.
- Each row shows the wave name + a `WaveformPreview`.
- Clicking a row calls `onBind(wave.id)` and closes the picker.
- Picker closes after selection or when the trigger button is clicked again.

## Tests

Use `vitest-browser-react`. Import `page` from `@vitest/browser/page`.

Test cases:
1. Unbound: renders "Bind wave" button; picker is not visible.
2. Unbound: clicking "Bind wave" shows the picker.
3. Picker: shows one entry per availableWave.
4. Picker: selecting a wave calls onBind with correct id and closes picker.
5. Bound: renders wave name and unbind button; no "Bind wave" button.
6. Bound: clicking unbind button calls onUnbind.

## Reference patterns

See `src/nodes/control/ui/SliderControl.browser.test.tsx` for the test pattern.
See `src/common-ui/WaveformPreview.tsx` for the WaveformPreview import.

Run `bun test WaveBindingButton` to verify. Run `bun typecheck` to check types.
