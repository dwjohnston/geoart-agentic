## Authoring Type Helpers

Type helpers are conditional TypeScript utility types that map between schema concepts and runtime TypeScript.

They commonly live in `src/schema/typeHelpers.ts` with tests in `src/schema/typeHelpers.test.ts`, but can live elsewhere.

Type helpers extract information from generated types (`_generated/schema-types.ts`, `_generated/node-inputs-2.ts`, `_generated/node-outputs-2.ts`, `_generated/value-kinds-2.ts`) and provide type-safe APIs for working with nodes, ports, and values.

### Anatomy of a Type Helper

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

### Common Patterns

#### Discriminated Union Extraction

```ts
type ComputeNodeKinds = ComputeNode['type'];
```

#### Conditional Type Narrowing

```ts
type IsArrayValueType<T extends ValueTypeNames> = T extends `${string}Array` ? true : false;
```

#### Template Literal Type Extraction

```ts
type ArrayItemType<T extends ValueTypeNames> = T extends `${infer Item}Array` ? Item : never;
```

#### Mapped Types over Keyed Objects

```ts
export type NodeInputsResolved<K extends keyof typeof nodeInputs> = {
  [Port in keyof typeof nodeInputs[K]]: typeof nodeInputs[K][Port] extends { valueType: infer VT extends ValueTypeNamesSuffixed }
  ? ResolvedValue<VT>
  : never
}
```

#### Recursive/Conditional Array Handling

```ts
export type StaticValueDeclared<T extends ValueTypeNames> =
  IsArrayValueType<T> extends true
  ? { v: Array<StaticValueDeclared<ArrayItemType<T>>> }
  : { v: ResolvedValue<`${T}Value`> };
```

### Test Patterns

#### Test Structure

Tests use `describe` blocks organised by type helper. **Group multiple related assertions in a single `it` block**; use comments to separate logical concerns:

```ts
describe("MyTypeHelper", () => {
  it("accepts valid inputs and rejects invalid ones", () => {
    // Valid cases
    assertType<MyTypeHelper>(validValue1);

    // Invalid cases
    //@ts-expect-error - why this should fail
    assertType<MyTypeHelper>(invalidValue1);
  });
});
```

Avoid one `it` block per assertion — group related checks together.

#### The `assertType` Helper

`assertType<T>(value)` is a no-op that forces TypeScript to check that `value` satisfies type `T`:

```ts
function assertType<T>(_value: T) { }
```

#### @ts-expect-error Pattern

```ts
//@ts-expect-error - control nodes cannot use refs
assertType<ControlNodeInputs>("slider">({
  value: { ref: "other.output" },
});
```

#### Negative Case Strategies

1. Wrong property key
2. Wrong value type
3. Forbidden pattern (e.g., refs not allowed)
4. Missing required property
5. Invalid enum value

Always include **at least one negative case per type helper.**

#### Array-Type Test Values

Use **concrete values** (never empty arrays `[]`):

```ts
// Good
assertType<StaticValueDeclared<"colorPointArray">>({ v: [{ v: fColorPoint() }] });

// Bad — loses type info
assertType<StaticValueDeclared<"colorPointArray">>({ v: [] });
```

### Workflow

1. **Understand the gap:** What schema concept needs exposing to algorithm code?
2. **Sketch the type:** Write a rough conditional type extracting from generated types.
3. **Test it first:** Write positive and negative cases before finalising.
4. **Refine:** Simplify, add comments where non-obvious, ensure edge cases pass.
5. **Run tests:** `bun test src/schema/typeHelpers.test.ts`

### Key Files

- `src/schema/typeHelpers.ts` — Type helper definitions
- `src/schema/typeHelpers.test.ts` — All tests
- `src/schema/_generated/schema-types.ts` — Generated discriminated unions
- `src/schema/_generated/node-inputs-2.ts` — Node kind → input ports
- `src/schema/_generated/node-outputs-2.ts` — Node kind → output ports
- `src/schema/_generated/value-kinds-2.ts` — Generated value primitive types

Run `bun typecheck` to verify — type errors in tests cause it to fail.
