# Task 06: Update pointsOnALine — Add colorSampler Input

Skill: `compute-node`

## Context

Part of the color-sampler feature. The existing `pointsOnALine` compute node (`src/nodes/compute/nodes/pointsOnALine.ts`) interpolates colour between two endpoint colours using a linear `t` parameter. This task adds an optional `colorSampler` input so colour can be driven parametrically instead.

## Schema Change

Already applied in Task 01. The `pointsOnALine` node now has an optional input:
- `colorSampler` — colorSamplerValue

## Behaviour

When `colorSampler` is present:
- For each point at index `i`, use the existing lerp `t` value (`t = i / (count - 1)`)
- Call `colorSampler.sample(t)` to get `{ r, g, b, a }`
- Use these values for the point's colour channels instead of the lerped endpoint colour

When `colorSampler` is absent: existing lerp behaviour is unchanged.

The mode on the connected `colorSampler` node is `clobber` — full replacement of the lerped colour.

## Notes

- The `t` value used for `colorSampler.sample(t)` must be the same `t` already used for position interpolation
- Endpoint colour lerp fallback must remain intact for backwards compatibility
