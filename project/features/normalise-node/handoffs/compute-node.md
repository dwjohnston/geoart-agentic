# compute-node handoff: normalise

The `normalise` node fits each input point array into a `normalisationSize`-sided bounding box centered on a normalisation center, rotated so the shape's own "up" direction points toward a normalisation origin. With input points forming a 2×2 square centered at the origin — `(-1,-1)`, `(1,-1)`, `(1,1)`, `(-1,1)` — a center of `(5,5)`, an origin of `(5,6)` (straight up, no rotation) and `normalisationSize: 4`, `strength: 1` produces `(3,3)`, `(7,3)`, `(7,7)`, `(3,7)`. An upward-pointing triangle — apex `(0,1)`, base corners `(-1,-1)` and `(1,-1)` — re-oriented with an origin at `(1,0)` (to the right of center `(0,0)`) and `normalisationSize: 2` comes out pointing right: apex → `(1,0)`, base corners → `(-1,1)` and `(-1,-1)`. `strength: 0` returns the original positions unchanged; `strength: 0.5` lerps halfway. A center/origin pair where origin coincides with center is skipped (no "up" direction is defined). A single input point has a degenerate (zero-size) bounding box and snaps directly onto the normalisation center regardless of size/rotation.

## Partial algorithm skeleton

```ts
{
  id: 'normalise',
  type: 'normalise',
  params: {
    inputPoints: { ref: 'someNode.points' },
    normalisationCenters: { ref: 'centersNode.points' },
    normalisationOrigin: { ref: 'originsNode.points' },
    normalisationSize: { v: 4 },
    strength: { v: 1 },
  },
},
```

Round-number test values:
- Square `(-1,-1),(1,-1),(1,1),(-1,1)`, center `(5,5)`, origin `(5,6)`, size `4`, strength `1` → `(3,3),(7,3),(7,7),(3,7)`
- Same square, strength `0.5` → first point `(-1,-1)` → `(1,1)`
- Upward triangle, center `(0,0)`, origin `(1,0)`, size `2`, strength `1` → apex `(1,0)`, base corners `(-1,1)` and `(-1,-1)`
- Single point `(7,7)`, center `(2,3)`, origin `(2,4)`, size `10`, strength `1` → `(2,3)`

## Registration

Registered via `src/schema/schema/schema.json` (`Normalise Compute Node` entry, type `normalise`) — will appear in `src/nodes/compute/registry.generated.ts` as `'normalise'` the next time `bun generate:registries` runs, since the registry is built by scanning `src/nodes/compute/nodes/` for non-test files. Implementation at `src/nodes/compute/nodes/normalise.ts`. Tests at `src/nodes/compute/nodes/normalise.test.ts` (16 tests).

**Not run in this environment:** `bun generate`, `bun test`, `bun typecheck`, `bun lint` — this headless run has no installed dependencies (`bun install` requires approval that wasn't available). Please run `bun validate` locally/in CI before merging to confirm the schema/type/test wiring is correct end-to-end.
