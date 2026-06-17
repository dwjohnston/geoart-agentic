# Pattern: conditional pass-through for nested module params

When a module wraps another module and wants to expose its inner params as optional pass-throughs, always use `fromInput(key)` only when the caller explicitly wired that param — otherwise pass a static `{ v: defaultValues[key] }`.

This preserves the inner module's own control panel when nothing is wired from outside.

Implementation in `curve-modulator-module.tsx`:

```ts
const waveNumberParam = (key: WaveNumberKey) =>
  key in params ? fromInput(key) : { v: defaultValues[key] as number };
const waveShapeParam = () =>
  'waveShape' in params ? fromInput('waveShape') : { v: defaultValues.waveShape };
```

Two helpers are needed (one for number ports, one for the enum port) because TypeScript cannot narrow `defaultValues[key]` from a union with a single generic helper.

Do not add controls for these params to the outer module's `renderControl` — the inner module renders its own controls when static values are supplied.
