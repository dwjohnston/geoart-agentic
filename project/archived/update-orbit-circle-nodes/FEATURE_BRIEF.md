# Feature Brief: Update Orbit Node — Multi-Centre Support

## Summary

Extend the `orbit` compute node to accept an array of centre points (`centerPoints`) rather than a single point. The node will produce orbits for every centre, flattening all output points into the existing `points` output (`colorPointArrayValue`). The deprecated single-`point` output is retained for backwards compatibility, returning the first point of the first orbit.

## Current State

The `orbit` compute node has:
- Input `center` — a single `pointValueOrRef`
- Output `point` (already marked `x-deprecated`) — single `pointValue`
- Output `points` — `colorPointArrayValue` (evenly-spaced coloured points around one orbit)

## Requested Changes

### Orbit node

1. **Deprecate `center`** — keep the existing `center` param in the schema and implementation, but mark it deprecated (via `deprecated: true` and a description note). When `center` is supplied and `centerPoints` is not, behaviour is unchanged.
2. **Add `centerPoints`** — a new input accepting `colorPointArrayValueOrRef`. Each element in the array defines a separate orbit centre (position; colour of the centre point is carried through to the output points of that orbit).
3. **Multi-orbit evaluation** — for each centre point in `centerPoints`, run the same orbit calculation (same `radius`, `speed`, `numPoints`, `phase`, `eccentricity`, `tilt`, `time`). Flatten all resulting points into the `points` output.
   - 3 centres × numPoints=1 → 3 output points
   - 3 centres × numPoints=2 → 6 output points
4. **Backwards-compat `point` output** — return `points[0]` of the first orbit (i.e. the very first element of the flattened array), or a fallback if the array is empty.

### Circle node

No changes required.

## Open Questions (resolved)

- The colour carried through from each `centerPoints` element: the orbit points should inherit the colour of their respective centre point. This is consistent with how `colorPointValue` is used elsewhere (it already carries r,g,b,a).
- When both `center` and `centerPoints` are provided: `centerPoints` takes precedence; `center` is ignored.
- When neither is provided: fall back to `{x:0.5, y:0.5}` (existing default behaviour).
