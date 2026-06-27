# Export and Share — Bug Fixes

Two bugs were found and fixed after the initial implementation of `snapshotGraph()`.

---

## Bug 1 — Module input marker ID mismatch

### Symptom

Modifying a module input (e.g. the number of points on an orbit) and then sharing produced a link that loaded the graph with the original default value, not the modified one.

### Cause

`snapshotGraph()` looked up module input markers using the module node's bare ID:

```ts
compiled.nodes.get(moduleNode.id)  // e.g. 'myOrbit'
```

But module input markers are stored in the compiled graph under a namespaced ID:

```ts
`${moduleId}:input-marker`         // e.g. 'myOrbit:input-marker'
```

This is produced by `createInternalId(moduleId, 'input-marker')` inside each module implementation. The lookup returned `undefined` for every module node, so the snapshot silently kept the original static param values from the graph definition and never applied the live values.

### Fix

```ts
compiled.nodes.get(`${moduleNode.id}:input-marker`)
```

---

## Bug 2 — Array params not round-tripping through the compiler

### Symptom

After loading a shared link for a graph with array-type module params (e.g. `centerPoints` on an orbit module), the evaluator threw:

```
resolveInput: no value for port "centerPoints" on node "inputOrbit:input-marker"
— no edge, no static param, and no default.
```

### Cause

The compiler's `paramToValue` function **flattens** array element wrappers when building compiled params. A graph param of:

```ts
{ v: [{ v: { x: 0, y: 0, r: 1, g: 1, b: 1, a: 1 } }] }
```

becomes the compiled `Value`:

```ts
{ kind: 'colorPointArray', v: [{ x: 0, y: 0, r: 1, g: 1, b: 1, a: 1 }] }
```

The snapshot wrote `{ v: value.v }` directly, producing:

```ts
{ v: [{ x: 0, y: 0, r: 1, g: 1, b: 1, a: 1 }] }
```

When that snapshot was compiled again, `paramToValue` processed the array and checked each element with:

```ts
if (typeof item === 'object' && item !== null && 'v' in item)
```

The element `{ x, y, r, g, b, a }` has no `v` key, so this check failed. `paramToValue` threw, `buildParams` caught the error and silently skipped the param, and the evaluator found nothing.

This affected all array-typed params: `colorPointArray`, `numberArray`, etc.

### Fix

A `valueToParam` helper was added inside `snapshotGraph` that re-wraps array elements before writing them back:

```ts
function valueToParam(value: Value): unknown {
  if (Array.isArray(value.v)) {
    return { v: (value.v as unknown[]).map(el => ({ v: el })) };
  }
  return { v: value.v };
}
```

This restores the `{ v: [{ v: element }, ...] }` structure that the compiler expects.
