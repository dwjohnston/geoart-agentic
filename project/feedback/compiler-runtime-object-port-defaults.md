# Compiler: runtime-object ports need null defaults on input-marker

## Why I was here

Adding `colorSampler` to the orbit-module schema created a port on the module's synthetic `module-input-marker` node. The evaluator requires every port to have a value (edge, static param, or port default). Runtime-object types (`colorSampler`, `sampler`) cannot be serialised as static params — they always arrive via edges.

When no colorSampler is wired into the orbit-module, the evaluator threw:

```
resolveInput: no value for port "colorSampler" (index 8) on node "myOrbit:input-marker"
— no edge, no static param, and no default.
```

## The fix

The compiler's `inputMarkerInputPorts` creation was updated to set `default: { v: null }` for `colorSampler` and `sampler` type ports. This mirrors what `implementComputeNode` already does for the orbit compute node's colorSampler port (`default: { v: null }`).

At runtime, `{ v: null }` passes through the input-marker's `(inputs) => inputs` evaluate, and the orbit compute node extracts `.v` to get `null`, which it already handles correctly.

## Suggested prompt improvement

If you are adding a runtime-object input (colorSampler, sampler) to a module schema, note that the module-input-marker node will need a null port default. The compiler sets these automatically for `colorSampler` and `sampler` types after the fix in `compiler.ts` (inputMarkerInputPorts creation).
