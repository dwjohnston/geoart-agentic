# LFO base-value boilerplate

The pattern `baseValue + wave output` appears repeatedly across algorithms — every LFO-driven parameter requires an `add` node just to apply the static offset:

```ts
{ id: 'someWave', type: 'wave', params: { time, frequency, amplitude, waveType } }
{ id: 'someValue', type: 'add', params: { a: { ref: 'lfoControl.baseValue' }, b: { ref: 'someWave.value' } } }
```

Two options to reduce this:

1. Add a `baseValue` param to the `wave` node itself, so it outputs `baseValue + wave` directly. One node instead of two per LFO-driven parameter.
2. Add a dedicated `modulatedValue` compute node that accepts `baseValue` and `waveValue` and outputs their sum — same reduction, but keeps `wave` pure.

Option 1 is simpler. The `lfo-control` node already bundles `baseValue` alongside the other LFO params specifically for this purpose, so having `wave` consume it directly is a natural fit.
