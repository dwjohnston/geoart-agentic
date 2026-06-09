---
title: "Compute Node Patterns"
description: "taxonomy of compute node categories and algorithm composition patterns"
---

# Compute Node Patterns

A taxonomy of compute node patterns for use during ideation, implementation, and algorithm authoring. This list is non-exhaustive — miscellaneous scalar utility nodes (`add`, `multiplier`, `time`) exist outside these categories. The taxonomy is general in nature and not a non-contradictory definition; nodes may exhibit characteristics of more than one category.

**Point arrays everywhere.** Nodes almost never deal in a single point — inputs and outputs are always `colorPointArrayValue`. Even when a node is conceptually used with a single point (e.g. a rotation centre), it is defined as an array so all nodes remain compatible with each other.

---

## Node Categories

### Position Makers

Generate a series of `colorPointArrayValue` points from scratch. Typically have a `numPoints` input.

Examples: `orbit`, `pointsOnALine`

**Contract:** Output count is determined by `numPoints`. Positional inputs (e.g. `centerPoints`, endpoints `a`/`b`) are generative parameters — where to generate from — not a subject array to transform. Output: `colorPointArrayValue`.

### Position Shifters

Take a `colorPointArrayValue` and return a `colorPointArrayValue` with modified positions. Point count is generally preserved, but some nodes may increase it — `normalise` multiplies points per normalisation target, and future `curveModulator` interpolation will add points between existing ones.

**Contract:** Input: `colorPointArrayValue` (subject). Output: `colorPointArrayValue` (same or greater count).

Two subtypes based on what drives the transformation:

**Point-based:** The transformation is defined by a second point array. Each point in that array acts as a transformation parameter — e.g. a reflection axis, rotation centre, or normalisation target. Examples: `reflect`, `rotate`, `normalise`.

**Non-point-based:** The transformation source is something other than a point array — typically a `Sampler` from a wave node. Example: `curveModulator` (displaces points perpendicular to their tangent using a wave sampler).

### Color Shifters

Take a `colorPointArrayValue` and return a `colorPointArrayValue` with modified color channels. Positions and point count are preserved.

**Contract:** Input: `colorPointArrayValue` (subject). Output: `colorPointArrayValue` (same count, same positions).

Two subtypes, mirroring position shifters:

**Point-based:** The transformation is defined by a second point array whose color values drive the shift. Example: `colorShift` (blends each input point's color toward nearby target points using inverse-distance weighting).

**Non-point-based:** The transformation source is something other than a point array — e.g. a wave or scalar input. No nodes of this subtype exist yet.

---

## Wave Node Patterns

The `wave` node is a compute node with two distinct outputs that serve different purposes.

### Temporal Use

The `value` output produces one scalar per tick, driven by `t` and `frequency`. Use when you need a single value that evolves over time — e.g. driving an orbit's speed or radius.

### Spatial Use

The `sampler` output is a `Sampler` that evaluates the wave at arbitrary positions along one cycle via `sample(fractionOfOneCycle)`. Use when you need a full wave shape each tick — e.g. displacing points along a curve.

`samplerTemporalImpact` controls how much the current tick shifts the spatial wave's phase, animating it over time.

### FM/AM Synthesis

FM/AM works differently depending on which output you are using.

**Temporal FM/AM:** Wire `modulator.value` → `primary.frequency` (or `amplitude`). The modulator produces one scalar per tick that becomes the primary's input directly.

**Spatial FM/AM:** Wire `modulator.sampler` → `primary.frequencyModulator` (or `amplitudeModulator`). During evaluation, the primary wave's sampler calls the modulator's sampler at each spatial position.

---

## Algorithm Composition Patterns

Common pipeline shapes for algorithm authors:

| Pattern | Example chain |
|---|---|
| Point generation → render | `orbit` → `connectDots` |
| Point generation → position shift → render | `orbit` → `curveModulator` → `connectDots` |
| Point generation → color shift → render | `orbit` → `colorShift` → `connectDots` |
| Temporal wave → node input | `wave.value` → `orbit.speed` |
| Spatial wave → position shift | `wave.sampler` → `curveModulator.modulator` |

Patterns can be combined — e.g. position shift followed by color shift before rendering.
