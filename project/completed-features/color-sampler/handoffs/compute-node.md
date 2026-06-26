# compute-node handoff: color-sampler — valueSampler

## What the node does

The `valueSampler` node wraps a static `numberValue` input as a `samplerValue` output. The resulting `Sampler` object always returns the constant `value` regardless of `t`. With `value: 0.5`, both `sample(1)` and `sample(2)` return `0.5`.

## Partial algorithm skeleton

```ts
{
  id: 'myValueSampler',
  type: 'valueSampler',
  params: {
    value: { v: 0.5 },
  },
},
```
