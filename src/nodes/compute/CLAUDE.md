# Compute Layer

Pure math nodes. No canvas. No DOM. No UI. No side effects.

A compute node is a function: `(inputs: Value[], ctx: EvalContext) => Value[]`.
It must produce the same output for the same inputs and time — no hidden state
outside of `ctx.getState / ctx.setState`.

## Node Anatomy

```typescript
// 1. The pure math function — no node wrapper, fully unit-testable
function evaluateWave(
  waveType: 'sine' | 'saw' | 'square',
  frequency: number,
  phase: number,   // degrees, 0–360
  t: number,       // seconds
): number { ... }

// 2. The NodeDef — describes ports to the graph system
const waveNodeDef: NodeDef = {
  type: 'wave',
  isTimeDependant: true,
  inputs: [
    { name: 'time',      type: 'number' },
    { name: 'frequency', type: 'number', default: { v: 1   } },
    { name: 'phase',     type: 'number', default: { v: 0   } },
    { name: 'waveType',  type: 'enum',   default: { v: 'sine' },
      options: ['sine', 'saw', 'square'] },
  ],
  outputs: [
    { name: 'value', type: 'number' },  // always -1 to 1
  ],
};

// 3. The NodeInstance — thin adapter, calls the pure function
const waveNode: NodeInstance = {
  id: 'wave-1',
  def: waveNodeDef,
  evaluate(inputs, ctx) {
    const t         = (inputs[0] as NumberValue).v;
    const frequency = (inputs[1] as NumberValue).v;
    const phase     = (inputs[2] as NumberValue).v;
    const waveType  = (inputs[3] as EnumValue).v as WaveType;
    return [{ kind: 'number', v: evaluateWave(waveType, frequency, phase, t) }];
  }
};
```

Keep the pure math function and the node wrapper in separate files:
- `src/compute/nodes/wave.ts` — pure math
- `src/compute/nodes/wave.node.ts` — NodeDef + NodeInstance

## Output Ranges

All number outputs from compute nodes must be in the range `-1 to 1` unless the
node is explicitly a scaling node (scale, scaleFromUnit, centredScale). Document
any exception with a comment.

Consumers must never assume a specific range — they should always use a scale node
downstream if they need a specific range.

## isTimeDependant

Set `isTimeDependant: true` if and only if the node reads `ctx.time` (directly or
via an input wired from a TimeNode). The graph evaluator uses this flag for dirty
propagation — a false positive forces unnecessary re-evaluation; a false negative
causes stale outputs. When in doubt, check whether removing the TimeNode input
would make the output constant.

## Trigonometry 

Any time an angle value is provided as a paramater,  (eg for passing into a sine function) the value should be expressed as a value 0-1, where 1 represents 360 degrees. Of course, values outside of 0-1 should be allowed, they will wrap around. 

## Node Catalogue

**Do not maintain a catalogue here.** The schema is the source of truth.

Before implementing any compute node — or checking what nodes already exist —
read the schema:

```
src/schema/schema.json → definitions.computeNode.properties.type.enum
```

Each string in that enum is a node type that must have a corresponding
implementation in this directory. Cross-reference with `src/compute/registry.ts`
to find which are implemented and which are missing.

## Adding a New Compute Node

1. Add the type string to `computeNode.properties.type.enum` in `src/schema/schema.json`.
2. Add any new param keys to `computeNode.properties.params.properties` in the schema.
3. Write the pure math function first (`src/compute/nodes/<type>.ts`). Test it in isolation.
4. Write the node wrapper (`src/compute/nodes/<type>.node.ts`).
5. Set `isTimeDependant` correctly in the NodeDef.
6. Register in `src/compute/registry.ts`.

The schema is updated first. If a type string is in the enum but missing from the
registry, that is a bug — the schema describes intent, the registry describes reality.

## What Not To Do

- Do not import anything from `src/render` or `src/control`.
- Do not call `document`, `window`, or `canvas` APIs.
- Do not store state in module-level variables — use `ctx.getState / ctx.setState`.
- Do not read `ctx.time` without setting `isTimeDependant: true`.
