# Feature Plan: Interactive Builder Controls

## Dependency Graph

```
T01: WaveformPreview     ─────────────────────────────┐
T02: SwingRangeControl   (independent)                 ├──► T04: WaveBindingButton
T03: ModifierStack       (independent)                 │
```

T01, T02, T03 are independent — run in parallel.
T04 depends on T01 (embeds WaveformPreview).

## Tasks

| # | Task file | Depends on |
|---|---|---|
| T01 | task_01_waveform_preview.md | — |
| T02 | task_02_swing_range_control.md | — |
| T03 | task_03_modifier_stack.md | — |
| T04 | task_04_wave_binding_button.md | T01 |
