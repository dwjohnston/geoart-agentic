# Derive value types from schema

## The problem

`src/graph/types.ts` manually declares the `Value` union and its variants:

```typescript
export type NumberValue  = { kind: 'number'; v: number };
export type ColorValue   = { kind: 'color';  v: { r: number; g: number; b: number; a: number } };
export type StringValue  = { kind: 'string'; v: string };
// ...
export type Value = NumberValue | ColorValue | StringValue | ...;
```

The schema already knows the shapes of these values — `numberParam`, `colorParam`, etc. all define the `v` envelope. The port type strings (`'number'`, `'color'`, `'string'`) in node defs reference these same concepts. This is duplicated knowledge that drifts.

It also blocks a desirable improvement to `ControlNodeDef`: the `evaluate` return type should be narrowed by `T` (the node type), so `ControlNodeDef<'slider'>` can declare `evaluate(): NumberValue[]` rather than `evaluate(): Value[]`. That narrowing requires a compile-time mapping from node type → value kind, which should itself come from the schema rather than another manual declaration.

## What would be involved

### 1. Canonicalise value kinds in the schema

The schema currently defines param shapes (the `{ v: ... }` envelopes) but not the value kinds used at runtime. A new `definitions` section would declare each kind explicitly:

```json
"valueKinds": {
  "number": { "type": "number" },
  "color":  { "type": "object", "properties": { "r": ..., "g": ..., "b": ..., "a": ... } },
  "string": { "type": "string" },
  "point":  { "type": "object", "properties": { "x": ..., "y": ... } }
}
```

This gives the generator a single source of truth for what each kind looks like.

### 2. Extend the code generator

The existing `generate:types` script produces `schema-types.d.ts` from the schema. It would need to also emit `src/graph/types.ts` (or a generated equivalent), producing the `Value` union and named variants from the `valueKinds` definitions above.

The generator would need to map each JSON Schema type to its TypeScript representation — numbers, strings, and objects with known property shapes.

### 3. Map node output ports to value kinds

Each node def's `outputs` array declares a `type` string (`'number'`, `'color'`, etc.). To narrow `evaluate`'s return type by `T`, the type system needs to know which `Value` variant corresponds to each port type string. A generated mapped type would handle this:

```typescript
// generated
type PortTypeToValue = {
  number: NumberValue;
  color:  ColorValue;
  string: StringValue;
  point:  PointValue;
};
```

With that in place, `ControlNodeDef<T>` could derive the output value type from the node's output port declarations — though this likely still requires per-node-type output port knowledge to be expressed in the type system, which may need a further schema-driven approach.

### 4. Delete `src/graph/types.ts`

Once generated, the manual file goes away. Any import of `NumberValue`, `ColorValue`, etc. points to the generated file instead.

## Complexity

Medium-to-high. The main work is in the generator. The schema changes are small; the tricky part is making the generator produce correct TypeScript for nested object shapes (particularly `ColorValue` and `PointValue`), and ensuring the generated types are stable enough not to produce noise in diffs.

The `evaluate` narrowing benefit is real but may need a separate step: even with generated value types, deriving `evaluate`'s return type from `T` at the `ControlNodeDef` level requires the type system to know each node type's output port types — which is currently runtime data (the `outputs` array), not compile-time type information. That last step may require generating a per-node-type output map alongside the value types.
