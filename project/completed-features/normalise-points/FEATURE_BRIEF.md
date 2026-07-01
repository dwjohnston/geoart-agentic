# Feature Brief: Normalise Points

## Overview

A compute node that fits an array of input points into a bounding box centered on one or more normalisation centers, with support for orientation via normalisation origin points.

## Inputs

- `inputPoints`: `colorPointArrayValueOrRef`
- `normalisationCenters`: `colorPointArrayValueOrRef`
- `normalisationOrigin`: `colorPointArrayValueOrRef`
- `normalisationSize`: `numberValueOrRef` (single uniform value — both axes scale equally)
- `strength`: `numberValueOrRef` (0–1, default 0 = identity / no effect)

## Output

- `points`: `colorPointArrayValue`

## Behaviour

For each normalisation center, for each normalisation origin, produce a copy of all input points fitted (normalised) to that center. Output cardinality: N input points × M centers × O origins → N×M×O output points.

`strength` lerps between the original positions (0) and fully normalised positions (1).

The normalisation origin determines 'up' — the direction the fitted copy faces. Each origin is used relative to its corresponding center (or globally if only one center is provided).

Normalisation centers and origins carry color values but these are ignored.

## Worked Example

Input: regular triangle at `(0, -0.5)`, `(0.5, 0.5)`, `(-0.5, -0.5)` — pointing upward.

- normalisationCenters: `[(0, 0)]`
- normalisationOrigin: `[(0, 0.25)]`, `[(-0.25, 0)]`, `[(0.25, 0)]`

Produces three copies:
1. Triangle pointing upward (origin above center)
2. Triangle pointing leftward (origin left of center)
3. Triangle pointing rightward (origin right of center)

To make all copies face the same direction regardless of orientation, use a very high negative y value for the origin (e.g. `(0, -9999)`) so all copies treat "down" as consistent.
