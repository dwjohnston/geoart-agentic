# Render Layer

Drawing nodes. Canvas access lives here and nowhere else.

A render node consumes `point` or `color` values from the compute layer and writes
to the canvas. It has no math responsibilities — if you find yourself doing
arithmetic in a render node, move that logic to a compute node instead.

## Render vs Compute Frame Rate

Render nodes do not run every frame. Each render node has an `intervalMs` param
that controls how often it fires. The graph evaluator checks elapsed time against
`lastFiredAt` and skips the node if the interval has not elapsed.

Compute nodes run every frame. Canvas compositing runs every frame. Only the
draw call itself is rate-limited.

This is why the gif's orbits move smoothly (60fps compute) but lines accumulate
gradually (e.g. 100ms interval render).

## Canvas Architecture

There are two canvases, composited together each frame:

- **orbitCanvas** — cleared every frame. Used for visual aids like orbit rings
  and moving dots. Render nodes that want to show current position draw here.
- **trailCanvas** — never cleared (unless the user resets). Used for accumulating
  lines, trails, and dots over time. Render nodes that build up a drawing over
  time draw here.

Each render node declares which canvas it draws to:

```typescript
const timedLineNode: RenderNodeDef = {
  type: 'timedLine',
  canvas: 'trail',       // accumulates — never cleared
  intervalMs: 100,
  inputs: [
    { name: 'pointA', type: 'point' },
    { name: 'pointB', type: 'point' },
    { name: 'color',  type: 'color' },
    { name: 'width',  type: 'number', default: { v: 1 } },
  ],
};
```

## Node Catalogue

| type        | canvas  | inputs                        | notes                              |
|-------------|---------|-------------------------------|------------------------------------|
| `timedLine` | trail   | pointA, pointB, color, width  | draws a line between two points    |
| `dot`       | trail   | point, color, radius          | draws a filled circle              |
| `circle`    | orbit   | point, color, radius          | redrawn every frame (orbit aid)    |
| `trail`     | trail   | point, color, radius, maxAge  | fading dot trail                   |

## Adding a New Render Node

- Declare which canvas it draws to (`orbit` or `trail`).
- Accept only `point`, `color`, `number`, or `trigger` inputs — never raw numbers
  representing canvas coordinates. Canvas scaling is handled by the evaluator
  before inputs reach the node.
- Register in `src/render/registry.ts`.
- Add to the catalogue above.
- Add the type string to the `renderNode.type` enum in `src/schema/schema.json`.

## Coordinate System

Render nodes receive canvas coordinates — the evaluator translates from the
compute layer's normalised space before passing inputs to render nodes.

The canvas origin is the centre of the viewport. Positive y is up (mathematical
convention, not screen convention). The evaluator handles the flip.

Do not hardcode canvas dimensions — read them from `ctx.canvas.width` and
`ctx.canvas.height`.

## What Not To Do

- Do not import anything from `src/control`.
- Do not perform math on input values — add a compute node upstream instead.
- Do not clear `trailCanvas` — only the user reset action may do this.
- Do not draw to `orbitCanvas` from a node with `canvas: 'trail'` or vice versa.
- Do not run draw logic outside of the `evaluate` method.
