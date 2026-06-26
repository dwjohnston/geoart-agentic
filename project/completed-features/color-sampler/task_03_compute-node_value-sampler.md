# Task 03: Implement valueSampler Compute Node

Skill: `compute-node`

## Context

Part of the color-sampler feature. `valueSampler` wraps a static `numberValue` as a `samplerValue` so static numbers (e.g. from sliders) can be fed into inputs that expect a sampler. The `sample(t)` function always returns `value` regardless of `t`.

## Schema

Defined in Task 01. Inputs/outputs:
- Input: `value` — numberValue
- Output: `sampler` — samplerValue

## Test Cases

| `value` | `t` | Expected `sample(t)` |
|---|---|---|
| `0.5` | `1` | `0.5` |
| `0.5` | `2` | `0.5` |

The key invariant: `t` is ignored — output is always `value`.

## Implementation Notes

The output `sampler` should implement the `Sampler` interface (defined in `src/schema/typeHelpers.ts`):
```typescript
type Sampler = {
  sample(t: number): number
  sampleMany(ts: number[]): number[]
}
```

Both `sample` and `sampleMany` should return the constant `value`.
