# Prompt improvement: casting runtime-only value kinds in compute-node skill

## Problem

When a compute node receives a runtime-only value kind (e.g. `samplerValue`, `colorSamplerValue`) as an input, the generated types produce `unknown`. The agent must cast explicitly:

```typescript
const cs = inputs.colorSampler as ColorSampler | null
```

This was not in the `compute-node` skill prompt, so Task 05 discovered it by fixing a pre-existing cast omission in `pointsOnALine.ts`, and Task 06 relied on that fix being already in place.

## Suggested addition to compute-node skill prompt

Add a section under Implementation Notes:

> **Runtime-only value kinds** — If your node receives a `samplerValue` or `colorSamplerValue` input, the generated type will be `unknown`. Cast it explicitly before use:
> ```typescript
> const sampler = inputs.sampler as Sampler | null
> const colorSampler = inputs.colorSampler as ColorSampler | null
> ```
> Both types are defined in `src/schema/typeHelpers.ts`.
