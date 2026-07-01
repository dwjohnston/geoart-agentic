# Prompt improvement: normalisePoints orientation description

The feature brief describes the normalisation origin as determining "up" but the worked example is what made the algorithm derivable. The prose alone ("The normalisation origin determines 'up'") does not specify:

1. Whether the origin is absolute or relative to the center (it's absolute).
2. Which angle formula maps origin direction to rotation (θ = π/2 − atan2(dy, dx), where (dx,dy) = origin − center).

**Suggestion:** Add to the behaviour description:

> The rotation angle applied to each copy is `θ = π/2 − atan2(origin.y − center.y, origin.x − center.x)`. An origin directly above the center (positive y offset) produces θ = 0 (no rotation). Origins are absolute positions, not offsets.

This makes the algorithm unambiguous without relying on the worked example to derive the formula.
