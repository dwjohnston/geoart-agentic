# Task 02: Declare Normalise Algorithm

## Skill: `algorithm`

## Prompt

Declare a reference algorithm for normalising a point cloud into a square bounding box centred on a target point.

### Algorithm: `normalise`

**Inputs:**
- `inputPoints` — array of color points
- `normalisationCenters` — array of color points (only x/y used; color ignored)
- `normalisationSize` — number: full side length of the target bounding box
- `strength` — number 0–1; lerp between original (0) and fully normalised (1)
- `mode` — `"product"` | `"sequential"`

**Output:** array of color points

**Normalisation (single center):**
1. Compute the bounding box of `inputPoints`.
2. Compute `scale = normalisationSize / max(bboxWidth, bboxHeight)`. If the bbox is degenerate (zero size), use `scale = 1`.
3. Compute the bbox center `bboxCenter`.
4. For each input point `p`, compute `normalised = center + (p - bboxCenter) * scale`.
5. Apply strength: `output = lerp(p, normalised, strength)`.
6. Output point inherits the color of its corresponding input point.

**Mode: `product`**
For each center in `normalisationCenters`, apply normalisation to all `inputPoints`.
Output cardinality: N × M (N input points, M centers).

**Mode: `sequential`**
Apply normalisation passes in order — the output of pass _k_ is the input of pass _k+1_.
Output cardinality: N (same as input).

### Examples

The algorithm file should include worked examples matching those in the feature brief:

1. Single center, `product`, `strength=1.0` — unit square scaled into bottom-left quadrant.
2. Three centers, `product`, `strength=1.0` — three stamped copies.
3. Two centers, `sequential`, `strength=0.5` — two progressive nudges.
