---
name: generate-type-helper
description: Write new TypeScript type helpers for the schema system; includes test patterns
---

## Overview

Type helpers are conditional TypeScript utility types that map between schema concepts and runtime TypeScript.

They commonly in `src/schema/typeHelpers.ts` and their tests in `src/schema/typeHelpers.test.ts`, but they can live else where as well. 

Type helpers extract information from generated types (`_generated/schema-types.ts`, `_generated/node-inputs-2.ts`, `_generated/node-outputs-2.ts`, `_generated/value-kinds-2.ts`) and provide type-safe APIs for working with nodes, ports, and values.

## Anatomy of a Type Helper

Type helpers are typically conditional/mapped/recursive types that:

1. **Accept constrained type parameters** — usually a discriminated union key (e.g., node kind, value type name) or a keyed object type
2. **Extract information** from generated types using conditional types, template literals, or keyed access
3. **Transform and return** a new type shape

**Example:** `ValueTypeByName<T>` takes a suffixed value type name (`"numberValue"`) and returns the raw value shape without the `kind` discriminator:

```ts
export type ValueTypeByName<T extends ValueTypeNamesSuffixed> = Omit<
  Extract<ValueTypes, { kind: T extends `${infer K}Value` ? K : never }>,
  'kind'
>
```

## Common Patterns

### Discriminated Union Extraction

Extract a subset from a union based on a discriminator:

```ts
// Extract only compute nodes from the full union
type ComputeNodeKinds = ComputeNode['type'];
```

### Conditional Type Narrowing

Use `extends` to narrow and extract:

```ts
// Does this value type name match an array pattern?
type IsArrayValueType<T extends ValueTypeNames> = T extends `${string}Array` ? true : false;
```

### Template Literal Type Extraction

Use `infer` to pull out parts of template literals:

```ts
// Extract "colorPoint" from "colorPointValue"
type ArrayItemType<T extends ValueTypeNames> = T extends `${infer Item}Array` ? Item : never;
```

### Mapped Types over Keyed Objects

Transform an object's values:

```ts
// Map node input port names to resolved (raw .v) types
export type NodeInputsResolved<K extends keyof typeof nodeInputs> = {
  [Port in keyof typeof nodeInputs[K]]: typeof nodeInputs[K][Port] extends { valueType: infer VT extends ValueTypeNamesSuffixed }
  ? ResolvedValue<VT>
  : never
}
```

### Recursive/Conditional Array Handling

Array types need branching logic:

```ts
// Non-array: static value is { v: ResolvedValue }
// Array: static value is { v: Array<StaticValueDeclared<ItemType>> }
export type StaticValueDeclared<T extends ValueTypeNames> =
  IsArrayValueType<T> extends true
  ? { v: Array<StaticValueDeclared<ArrayItemType<T>>> }
  : { v: ResolvedValue<`${T}Value`> };
```

## Test Patterns

### Test Structure

Tests use `describe` blocks organized by type helper or concept. Each test includes positive and negative cases:

```ts
describe("MyTypeHelper", () => {
  it("positive case: accepts valid input", () => {
    assertType<MyTypeHelper>(validValue);
  });

  it("negative case: rejects invalid input", () => {
    //@ts-expect-error - why this should fail
    assertType<MyTypeHelper>(invalidValue);
  });
});
```

### The `assertType` Helper

`assertType<T>(value)` is a no-op that forces TypeScript to check that `value` satisfies type `T`:

```ts
function assertType<T>(_value: T) { }
```

Call it with test values to verify they match (or don't match) the expected type.

### @ts-expect-error Pattern

Use `@ts-expect-error` on the line **before** an `assertType` call to expect a type error:

```ts
// This type rejects refs for control nodes
//@ts-expect-error - control nodes cannot use refs
assertType<ControlNodeInputs>("slider">({
  value: { ref: "other.output" },
});
```

The comment explains **why** it should error.

### Negative Case Strategies

1. **Wrong property key:** Provide a port/property name that doesn't exist
2. **Wrong value type:** Provide the wrong primitive type (e.g., string instead of number)
3. **Forbidden pattern:** Test constraints like "refs not allowed here"
4. **Missing required property:** For arrays/objects, omit a required item
5. **Invalid enum value:** For enum types, use a value outside the allowed set

Always include **at least one negative case per type helper.**

### Array-Type Test Values

When testing array types, use **concrete values** (never empty arrays `[]`):

```ts
// Good: uses actual factory function
assertType<StaticValueDeclared<"colorPointArray">>({
  v: [{ v: fColorPoint() }]
});

// Bad: empty array — loses type info
assertType<StaticValueDeclared<"colorPointArray">>({
  v: []
});
```

### Function Type Tests

For callable types, declare a typed function and invoke it with test arguments:

```ts
// Declare function with the type you're testing
const fn: ModuleControlSetter<"orbit-module"> = (params, value) => {
  // Implementation can be empty
}

// Valid calls — no errors expected
fn("radius", 9)
fn("speed", 10)
fn("centerPoints", [fColorPoint()])

// Invalid call — expect a type error
//@ts-expect-error - mismatching param key
fn("garbage", null);
```

This pattern verifies:
- Parameter names are constrained (only valid param keys accepted)
- Parameter value types are constrained (type mismatch rejects)
- Return type is correct (if the function returns something, verify it)

## Workflow

1. **Understand the gap:** What schema concept do you need to expose to algorithm code? (E.g., "I need to know which ports a node outputs.")
2. **Sketch the type:** Write a rough conditional type that extracts this information from the generated types.
3. **Test it first:** Write a describe block with positive and negative cases before finalizing the helper.
4. **Refine:** Simplify, add comments if the logic is non-obvious, ensure all edge cases pass.
5. **Run tests:** `bun test src/schema/typeHelpers.test.ts` to verify.

## Key Files

- **`src/schema/typeHelpers.ts`** — Type helper definitions
- **`src/schema/typeHelpers.test.ts`** — All tests (organized by helper)
- **`src/schema/_generated/schema-types.ts`** — Generated discriminated unions (ControlNode, ComputeNode, RenderNode, ModuleNode, ValueTypes)
- **`src/schema/_generated/node-inputs-2.ts`** — Mapping of node kind → input ports and their value types
- **`src/schema/_generated/node-outputs-2.ts`** — Mapping of node kind → output ports and their value types
- **`src/schema/_generated/value-kinds-2.ts`** — Generated value primitive types

## Running Tests

```bash
# Test the type helpers file
bun typecheck
```

Type errors in tests will cause `bun typecheck` to fail — fix them and re-run.