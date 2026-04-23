# Feedback: LFO Modulation Patterns

The `add` + `multiplier` combination for `base × (1 + lfo)` requires three nodes and two intermediate IDs per modulated value. In the LFO Planets graph this means 6 extra nodes (4 `add`, 2 `multiplier`) just for modulation wiring — before any actual computation.

## The cumbersome pattern

```
radiusLFO → add(1, lfo) → radiusMod → multiplier(base, mod) → orbit.radius
```

Every modulated port needs: an LFO node, an offset-add node, a multiplier node, and a base control. Four nodes per modulated value.

## Possible fix: a dedicated `lfoModulator` node

A single node that wraps the whole pattern:

- inputs: `time`, `frequency`, `amplitude`, `base`
- output: `value = base × (1 + sine(time × frequency) × amplitude)`
- With `amplitude=0` → `value = base`. Always well-behaved.

This would replace the current 4-node chain per modulated value with a single node, and make the intent legible at a glance. The current primitives (`wave`, `add`, `multiplier`) remain useful for other compositions.
