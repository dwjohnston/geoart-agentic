# Task 03 — algorithm: Wave Module Reference Algorithm

Use the `algorithm` skill.

## Goal

Write a reference algorithm demonstrating the `wave` module node.

## Read first

Read `projects/features/wave-module/handoffs/task_02_module.md` for confirmed node type name and port names.

## Algorithm intent

A minimal reference graph that exercises the wave module. Model it after the existing `waveModulatorReferenceGraph.ts` — a line of points modulated by a wave module's sampler output.

The algorithm should demonstrate:
- Connecting frequency, amplitude, and phase socket inputs
- Using the `sampler` output with a `curveModulator`

## Location

`src/algorithms/reference/node_specific/waveModuleReferenceGraph.ts`

Register in `src/algorithms/index.ts`.
