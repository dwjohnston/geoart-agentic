# Task 05: Update orbit — Add colorSampler Input

Skill: `compute-node`

## Context

Part of the color-sampler feature. The existing `orbit` compute node (`src/nodes/compute/nodes/orbit.ts`) currently inherits the centre point's colour for every generated point. This task adds an optional `colorSampler` input so the colour of each orbit point can be driven parametrically.

## Schema Change

Already applied in Task 01. The `orbit` node now has an optional input:
- `colorSampler` — colorSamplerValue

## Behaviour

When `colorSampler` is present:
- For each generated point at index `i`, compute `t = i / numPoints` (values in range [0, 1))
- Call `colorSampler.sample(t)` to get `{ r, g, b, a }`
- Use these values for the point's colour channels instead of the inherited centre-point colour

When `colorSampler` is absent: existing behaviour is unchanged (colour inherited from centre point).

The mode on the connected `colorSampler` node is `clobber` — full replacement, no blending.

## Notes

- `numPoints` in the `t` calculation should be the same value used for point spacing (post-rounding)
- The centre-point colour fallback must remain intact for backwards compatibility
