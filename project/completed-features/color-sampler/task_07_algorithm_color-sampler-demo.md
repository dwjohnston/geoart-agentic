# Task 07: Write Reference Algorithm — color-sampler-demo

Skill: `algorithm`

## Context

Part of the color-sampler feature. Write a reference algorithm demonstrating the `colorSampler` and `valueSampler` nodes driving the colour of an orbit ring.

## Reference Algorithm

- `time` → `wave` (frequency `1`, amplitude `0.5`, offset `0.5`) → `colorSampler.sampleR`
- `numberSlider(min: 0, max: 1, default: 0.0)` → `valueSampler` → `colorSampler.sampleG`
- `numberSlider(min: 0, max: 1, default: 0.0)` → `valueSampler` → `colorSampler.sampleB`
- `numberSlider(min: 0, max: 1, default: 1.0)` → `valueSampler` → `colorSampler.sampleA`
- `colorSamplerModeSelector` (default: `clobber`) → `colorSampler.mode`
- `colorSampler` → `orbit.colorSampler`
- `orbit` → render node on `live` canvas

Result: orbit ring where the red channel pulses with the wave; G, B, A are slider-controlled.

## File Location

`src/algorithms/reference/color_sampler_demo.ts` (or follow the existing naming convention for reference algorithms in that directory).

Register in `src/algorithms/index.ts`.
