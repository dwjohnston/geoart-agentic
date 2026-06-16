# Feature Brief: color-sampler

## Overview

Introduce parametric colour variance for curve-generating nodes. Currently `orbit` inherits one colour from the centre point for all generated points; `pointsOnALine` lerps between two endpoint colours. This feature adds a `colorSamplerValue` abstraction — a runtime function `sample(t) → { r, g, b, a }` — and two compute nodes to produce it, so any node that generates arrays of points can have per-point colour driven by waves or static values.

## New Value Kind: `colorSamplerValue`

Runtime-only value (like `samplerValue`). Wraps:

```typescript
type ColorSampler = {
  sample(t: number): { r: number; g: number; b: number; a: number }
}
```

Cannot be statically defined in JSON. The schema entry is a placeholder object, same pattern as `samplerValue`.

## New Compute Node: `valueSampler`

Wraps a static `numberValue` as a `samplerValue` that returns the same value for any `t`. Enables static numbers (e.g. from a slider) to be fed into inputs that expect a sampler.

**Inputs:**
- `value` — numberValue

**Outputs:**
- `sampler` — samplerValue

### Test Cases

| `value` | `t` | Expected `sample(t)` |
|---|---|---|
| `0.5` | `1` | `0.5` |
| `0.5` | `2` | `0.5` |

## New Compute Node: `colorSampler`

Assembles four channel samplers into a `colorSamplerValue`. Calling `sample(t)` delegates to each channel sampler at `t` and returns `{ r, g, b, a }`.

**Inputs:**
- `sampleR` — samplerValue
- `sampleG` — samplerValue
- `sampleB` — samplerValue
- `sampleA` — samplerValue
- `mode` — enum: `clobber`

**Outputs:**
- `colorSampler` — colorSamplerValue

### Test Cases

| `sampleR(t)` | `sampleG(t)` | `sampleB(t)` | `sampleA(t)` | `t` | Expected output |
|---|---|---|---|---|---|
| always `1.0` | always `0.0` | always `0.0` | always `1.0` | `1` | `{ r: 1.0, g: 0.0, b: 0.0, a: 1.0 }` |
| returns `t` | always `0.0` | always `0.0` | always `1.0` | `0` | `{ r: 0.0, g: 0.0, b: 0.0, a: 1.0 }` |
| returns `t` | always `0.0` | always `0.0` | always `1.0` | `1` | `{ r: 1.0, g: 0.0, b: 0.0, a: 1.0 }` |

### Reference Algorithm

- `time` → `wave` (frequency `1`, amplitude `0.5`, offset `0.5`) → `colorSampler.sampleR`
- `numberSlider(0, 1, default 0.0)` → `valueSampler` → `colorSampler.sampleG`
- `numberSlider(0, 1, default 0.0)` → `valueSampler` → `colorSampler.sampleB`
- `numberSlider(0, 1, default 1.0)` → `valueSampler` → `colorSampler.sampleA`
- `colorSampler` → `orbit.colorSampler`
- `orbit` renders to `live` canvas

Result: orbit ring where the red channel pulses with the wave; G, B, A are slider-controlled.

## Updates to Existing Nodes

### `orbit`

Add optional input:
- `colorSampler` — colorSamplerValue

When present, use `t = i / numPoints` (where `i` is the point index) to call `colorSampler.sample(t)` and apply the result to each point's `{ r, g, b, a }` channels. Mode `clobber` replaces the inherited centre-point colour entirely.

### `pointsOnALine`

Add optional input:
- `colorSampler` — colorSamplerValue

When present, use the existing lerp `t` parameter to call `colorSampler.sample(t)` and replace the interpolated colour. Mode `clobber` replaces the lerped colour entirely.

## Out of Scope

- Module wrapper nodes for `valueSampler` / `colorSampler`
- Blend mode (strength parameter) — `clobber` only for now
- Spatial `(x, y)` sampling — parametric `t` only
- Other curve-generating nodes beyond `orbit` and `pointsOnALine`
