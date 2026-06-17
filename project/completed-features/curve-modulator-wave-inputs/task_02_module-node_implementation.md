# Task 02 — module-node: Wire wave params in curve-modulator-module

File: `src/nodes/module/nodes/curve-modulator-module.tsx`

## Changes

1. Add all five wave params to `defaultValues`:
   - `frequency: 1`
   - `amplitude: 0.5`
   - `phase: 0`
   - `waveShape: 'sine'`
   - `samplerTemporalImpact: 0`

2. Replace the hardcoded wave-module params with `fromInput(...)` calls:
   ```ts
   params: {
     frequency: fromInput('frequency'),
     amplitude: fromInput('amplitude'),
     phase: fromInput('phase'),
     waveShape: fromInput('waveShape'),
     samplerTemporalImpact: fromInput('samplerTemporalImpact'),
   }
   ```

3. Add UI controls for all five params in `renderControl` (inside the ModulePanel):
   - `waveShape` — DropdownControl with WAVE_TYPES options
   - `frequency` — KnobControl (min 0.01, max 20, step 0.01)
   - `amplitude` — KnobControl (min 0, max 2)
   - `phase` — KnobControl (min 0, max 1)
   - `samplerTemporalImpact` — KnobControl (min 0, max 0.1, step 0.001)

## Tests

Update `curve-modulator-module.test.tsx`:
- Update the `applies default values` test to include the five wave params
- Add a test verifying the wave-module params are wired to `fromInput` refs (i.e. `ref: 'myModulator:input-marker.frequency'` etc.)
