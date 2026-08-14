# Handoff: Interactive Builder Controls

## What was delivered

Four new React components in `src/common-ui/`, each with browser tests:

- **WaveformPreview** — SVG waveform display. Fixed time window (2× cycleLength ticks). Props: `signalFn`, `cycleLength`, `width`, `height`.
- **SwingRangeControl** — Min/max numeric inputs with a symmetric influence slider. Props: `min`, `max`, `step`, `onChange`.
- **ModifierStack** — Generic stackable list with `+` / type-picker / remove. Props: `items`, `availableTypes`, `onAdd`, `onRemove`, `renderItem`.
- **WaveBindingButton** — Per-parameter wave bind/unbind toggle with picker panel showing WaveformPreview per wave. Props: `boundWaveId`, `availableWaves`, `onBind`, `onUnbind`.

## Test status

49 browser tests passing (vitest + chromium). Run with `bun test:browser:headless`.

## Open design questions (from ideation)

- Wave registry panel placement: route by module kind vs. placement metadata on the module definition (parked).
- Point modifier eligibility: confirm inference from `colorPointArrayValue` output type.

## Next steps

These controls are building blocks. The next layer is wiring them into the actual builder side panel — connecting `WaveBindingButton` to the wave registry state, and `ModifierStack` to the graph mutation logic.
