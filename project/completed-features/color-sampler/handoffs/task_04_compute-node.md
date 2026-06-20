# compute-node handoff: colorSampler

The `colorSampler` node assembles four channel samplers (R, G, B, A) into a `ColorSampler` object. Calling `sample(t)` on the output delegates to each channel sampler at `t` and returns `{ r, g, b, a }`.

Test values demonstrate:
- Constant samplers (`r=1, g=0, b=0, a=1`) at `t=1` → `{ r: 1.0, g: 0.0, b: 0.0, a: 1.0 }`
- Identity sampler on R at `t=0` → `{ r: 0.0, g: 0.0, b: 0.0, a: 1.0 }`
- Identity sampler on R at `t=1` → `{ r: 1.0, g: 0.0, b: 0.0, a: 1.0 }`

## Algorithm skeleton

```ts
{
  id: 'myColorSampler',
  type: 'colorSampler',
  params: {
    sampleR: { ref: 'someWave.sampler' },
    sampleG: { ref: 'someOtherWave.sampler' },
    sampleB: { ref: 'anotherWave.sampler' },
    sampleA: { v: null },
    mode: { v: 'clobber' },
  },
},
```
