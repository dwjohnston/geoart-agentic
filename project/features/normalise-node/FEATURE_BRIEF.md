# Feature Brief: Normalise Node

Fits an array of input points into a bounding box centered on one or more normalisation centers.

## Inputs

- `inputPoints`: `colorPointArrayValueOrRef`
- `normalisationCenters`: `colorPointArrayValueOrRef`
- `normalisationOrigin`: `colorPointArrayValueOrRef`
- `normalisationSize`: `numberValueOrRef` (single uniform value)
- `strength`: `numberValueOrRef` (0–1, default 0 = identity / no effect)

## Output

- `points`: `colorPointArrayValue`

## Behaviour

For each normalisation center, for each normalisation origin, produce a copy of all input points fitted (normalised) to that center. Product cardinality — N input points × M centers × O normalisationOrigin → N×M×O output points. `strength` lerps between the original positions (0) and fully normalised positions (1).

The normalisation origin determines 'up'.

### Worked example

Input points are a regular triangle pointing 'upward'. A normalisation center of `(0,0)` and three normalisation origins at `(0,0.25)`, `(-0.25, 0)` and `(0.25,0)` will create new triangles pointing upward, leftward, and rightward respectively.

If you wanted them to all face the same direction, you would provide a very high negative y value for the origin.

Normalisation centers and origins have color, but this does not do anything.

## Out of scope

- No module node — this issue asks only for the compute node.
- Color is inherited unchanged from the input point; normalisation centers/origins' colors are unused.

Source: https://github.com/david-johnston-org/geoart-agentic/issues/127
