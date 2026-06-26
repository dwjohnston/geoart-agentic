# control-node handoff: colorSamplerModeSelector

## Description

`colorSamplerModeSelector` is a dropdown control node that exposes a `colorSamplerModeEnumValue` output port named `mode`. Users pick from the available enum values (`clobber`). The selected value is emitted on the `mode` output and can be wired into the `colorSampler` compute node's `mode` input.

## Schema note

The param is named `mode` (matching the output port), not `value` as is conventional in other enum selector nodes. This was required because `evaluate` reads `params[outputPortName]`.

## Algorithm skeleton

```ts
{
  id: 'colorSamplerMode',
  type: 'colorSamplerModeSelector',
  params: {
    label: { v: 'Mode' },
    mode: { v: 'clobber' },
  },
},
```
