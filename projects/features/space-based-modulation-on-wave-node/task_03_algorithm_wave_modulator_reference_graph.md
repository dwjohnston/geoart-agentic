# Task 03 — algorithm-agent: Reference graph for wave space-based modulation

## Context

Read the handoffs from previous tasks:
- `projects/features/space-based-modulation-on-wave-node/handoffs/01_schema.md`
- `projects/features/space-based-modulation-on-wave-node/handoffs/02_compute.md`

Existing reference graphs live in `src/algorithms/reference/node_specific/`. The file naming convention requires the suffix `ReferenceGraph` (see `src/algorithms/reference/CLAUDE.md`). The `curveModulatorReferenceGraph.ts` is the closest analogue and a good structural reference.

Reference graphs for `node_specific` must be minimal — just enough to demonstrate the node's feature.

Algorithms are registered in `src/algorithms/index.generated.ts`.

## Deliverable

Create `src/algorithms/reference/node_specific/waveModulatorReferenceGraph.ts`.

The graph should:
1. Use a `time` node to provide the tick count.
2. Have a primary `wave` node that produces a `sampler` output (this is the node being demonstrated).
3. Wire a second `wave` node's `sampler` output into the primary wave's `frequencyModulator` — this demonstrates space-based frequency modulation.
4. Use a `pointsOnALine` node to generate a set of points.
5. Use a `curveModulator` node to apply the primary wave's `sampler` to those points.
6. Render the result with a `connect-dots` render node on the `live` layer.

Keep slider controls to a minimum. Inline literal param values (`{ v: ... }`) where reasonable.

After creating the file, add it to `src/algorithms/index.generated.ts` following the same import and registration pattern used for existing node_specific reference graphs.

Run `bun validate` to confirm everything passes.
