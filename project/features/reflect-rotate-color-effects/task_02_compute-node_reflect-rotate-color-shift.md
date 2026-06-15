# Task 02 — compute-node: Reflect & Rotate Color Shift

## Skill
`compute-node`

## Context

Feature: Reflect & Rotate Color Effects
Feature brief: `project/features/reflect-rotate-color-effects/FEATURE_BRIEF.md`
Schema handoff: `project/features/reflect-rotate-color-effects/handoffs/task_01_handoff.md`

## Task

Update **both** `reflect` and `rotate` compute node implementations to handle the new `colorShiftOperation` parameter.

### Proximity-Angle Driver

The effect strength is always computed as:

```
driver = falloff(distance) * cos(angle)   →  range: -1..+1
```

Where:
- `distance` = Euclidean distance from the input point to the r/r point
- `angle` = angle of the vector from r/r point to input point, relative to the mirror axis (reflect) or rotation axis (rotate)
- `falloff` = a decreasing function of distance (constant implementation — choose a reasonable constant)

Driver interpretation:
- `driver = 0` — no effect (point on mirror/axis)
- `driver = +1` — maximum positive effect (angle = 0°, far from r/r)
- `driver = -1` — maximum negative/opposite effect (angle = 180°, far from r/r)

### Operations

**`none`** — input color copied as-is (existing behaviour).

**`blend`** — lerp each channel toward r/r color (driver > 0) or complement (driver < 0):
- positive: `output = lerp(input, rrColor, |driver|)`
- negative: `output = lerp(input, 1 - rrColor, |driver|)`
- Alpha participates as a fourth channel.

**`hue-shift`** — rotate hue in HSL space:
- positive: shift hue toward r/r hue
- negative: shift hue away from r/r hue (opposite arc)
- r/r point alpha scales the shift magnitude
- Output alpha unchanged from input.

**`lighten`** — screen/multiply blend:
- positive: screen blend toward r/r color (lightens)
- negative: multiply by r/r color (darkens)
- Alpha participates as a fourth channel.

**`saturate`** — push saturation in HSL space:
- positive: saturation shifts toward r/r saturation
- negative: saturation shifts away from r/r saturation
- Alpha participates as a fourth channel.

### Null Channel Handling

- Input point has any null channel: pass color through unchanged (preserve nulls).
- r/r point has a null channel: that channel is a no-op (input channel unchanged for that dimension only).
- `hue-shift` requires all three RGB channels non-null on the input; if any is null, pass through.

### `colorShiftOperation` absent or `"none"`

Skip all color shift logic entirely — existing colour output behaviour unchanged.

## Notes

- The core driver calculation and operation implementations are shared logic between `reflect` and `rotate`. Extract into a helper function in a shared file if appropriate.
- Both nodes should produce identical colour behaviour for the same inputs; only the geometry differs.

## Handoff

Write `project/features/reflect-rotate-color-effects/handoffs/task_02_handoff.md` with:
- Summary of implementation approach
- Location of any shared helper code
- Any notable constants chosen for falloff
