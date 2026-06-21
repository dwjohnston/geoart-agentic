# Task 02 — module-node: Wave Module Implementation

Use the `module-node` skill.

## Goal

Implement the `wave` module node.

## Read first

Read `projects/features/wave-module/handoffs/task_01_schema.md` for the confirmed schema definition.

## Behaviour

The module wraps an internal wave oscillator with optional FM and AM modulation. All modulation is internal — no external socket connections.

### Internal controls

**Primary wave**
- `waveShape` — dropdown of all supported wave types (sine, square, triangle, sawtooth, etc.)
- `samplerTemporalImpact` — slider (0–1)

**FM (Frequency Modulation)** — internal oscillator modulating the primary frequency
- `fmFrequency` — slider
- `fmAmount` — slider (modulation depth)
- `fmTemporalImpact` — slider (0–1)

**AM (Amplitude Modulation)** — internal oscillator modulating the primary amplitude
- `amFrequency` — slider
- `amAmount` — slider (modulation depth)
- `amTemporalImpact` — slider (0–1)

FM and AM modulators share the same wave type as the primary oscillator.

## Reference

`src/algorithms/reference/node_specific/waveModulatorReferenceGraph.ts` shows the manual wiring pattern this module encapsulates.

## Handoff

Write `projects/features/wave-module/handoffs/task_02_module.md` confirming the registered module node type name and output port names, for the algorithm task to consume.
