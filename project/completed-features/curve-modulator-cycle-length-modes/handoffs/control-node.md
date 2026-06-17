# control-node handoff: CycleLengthModeDropdown

The `cycleLengthModeSelector` dropdown now exposes all three modes: `arrayLength`, `linearOne`, and `linearTotal`.

## Algorithm skeleton

```ts
{
  id: 'cycleLengthMode',
  type: 'cycleLengthModeSelector',
  params: {
    label: { v: 'Cycle Length Mode' },
    value: { v: 'arrayLength' },
  },
},
```
