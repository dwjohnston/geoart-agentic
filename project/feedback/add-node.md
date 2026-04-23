# Suggestion: Add `add` compute node

A simple node that sums two number inputs and outputs the result.

**Motivation:** Needed for composing a static base value with an LFO output (e.g. `base_speed + lfo.value`). Without it, graph authors have no way to offset a modulated signal. Came up while building LFO Planets (`feature/lfo-planets`).

**Proposed spec:**
- Inputs: `a` (number), `b` (number)
- Output: `value` (number) = a + b
