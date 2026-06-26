# Task 04: Implement colorSampler Compute Node

Skill: `compute-node`

## Context

Part of the color-sampler feature. `colorSampler` assembles four channel samplers (R, G, B, A) into a `colorSamplerValue`. Calling `sample(t)` on the output delegates to each channel sampler at `t` and returns `{ r, g, b, a }`.

## Schema

Defined in Task 01. Inputs/outputs:
- Input: `sampleR` — samplerValue
- Input: `sampleG` — samplerValue
- Input: `sampleB` — samplerValue
- Input: `sampleA` — samplerValue
- Input: `mode` — colorSamplerModeEnumValue
- Output: `colorSampler` — colorSamplerValue

## Test Cases

| `sampleR(t)` | `sampleG(t)` | `sampleB(t)` | `sampleA(t)` | `t` | Expected output |
|---|---|---|---|---|---|
| always `1.0` | always `0.0` | always `0.0` | always `1.0` | `1` | `{ r: 1.0, g: 0.0, b: 0.0, a: 1.0 }` |
| returns `t` | always `0.0` | always `0.0` | always `1.0` | `0` | `{ r: 0.0, g: 0.0, b: 0.0, a: 1.0 }` |
| returns `t` | always `0.0` | always `0.0` | always `1.0` | `1` | `{ r: 1.0, g: 0.0, b: 0.0, a: 1.0 }` |

## Implementation Notes

The output `colorSampler` should implement the `ColorSampler` interface (defined in `src/schema/typeHelpers.ts` by Task 01):
```typescript
type ColorSampler = {
  sample(t: number): { r: number; g: number; b: number; a: number }
}
```

`mode` is `clobber` — the only mode for now. The mode value is captured in the closure but does not change behaviour at this stage (it is there for future extensibility).
