# Feature Brief: Sampler

## Problem Statement

The wave node currently evaluates once per frame, producing a single scalar output. This limitation prevents drawing wave shapes (like a sine wave) across the canvas — you can only get one value per tick.

To draw a sine wave as a visual shape, you need to evaluate the wave function at many spatial positions within the same tick. The current architecture doesn't support this multi-evaluation pattern.

## Solution Overview

Introduce a **sampler value type** — a runtime function wrapper that enables lazy evaluation of a wave at arbitrary positions. This becomes a new output port on the wave node. Other nodes can then use the sampler to evaluate the wave at multiple points in sequence.

Key components:

1. **`samplerValue` type**: Runtime-only value holding `sample(t: number) => number` and `sampleMany(ts: number[]) => number[]` functions
2. **Wave node `sampler` output**: Exposes a sampler that evaluates the wave at any position `t` (0–1), incorporating the wave's frequency, amplitude, phase, and animating over time
3. **`PointsOnALine` modulation**: New `modulateBy` param accepts a sampler; each point is displaced perpendicular to the line by the sampler value at that point's normalised position
4. **`connectDots` render node**: Draws lines connecting consecutive coloured points in sequence — the visual output of the modulated array

## Use Case

```
time node → wave node (scalar value + sampler output)
sampler output → pointsOnALine (modulateBy param)
pointsOnALine (modulated points) → connectDots render node
```

Result: A smooth sine wave shape drawn across the canvas, animating over time.

## Key Design Decisions

### Sampler semantics
- `sample(t)` evaluates the wave at normalised position `t ∈ [0, 1]`, computing: `amplitude * waveFunc(frequency * t + time + phase)`
- `time` is incorporated as a phase offset, allowing the wave to animate and scroll
- `t` is a spatial coordinate (position along a line), not a time value
- This decouples the wave's animation from its spatial evaluation

### PointsOnALine modulation
- For `n` points evenly spaced along the line, point `i` is displaced by `sampler.sample(i / (n-1))`
- Displacement is perpendicular to the line (90° rotation of the line vector)
- Colour of each point is preserved from the original array

### samplerValue in the schema
- Cannot be statically defined in JSON (it's a function)
- Only exists as a ref from another node's output
- Schema defines it but marks it as runtime-only
- Code generation needs special handling (manual type override)

## Questions for Clarification

None at this stage — the requirements and use case are clear from the implementation context.

## Acceptance Criteria

- Wave node has both `value` (scalar) and `sampler` outputs; existing `value` output works as before
- PointsOnALine accepts optional `modulateBy` param; no param = no modulation (backward-compatible)
- connectDots render node draws visible lines between consecutive points
- Test graph: time → wave (sampler) → pointsOnALine (modulateBy) → connectDots renders a smooth, animated sine wave shape
