# Snapshot invariant — compiled array params are flattened

When reading param values out of a `CompiledGraph` node and writing them back into a `GeoArtGraph`, array-typed values need special handling.

`paramToValue` (compiler) strips the per-element `{ v: ... }` wrapper when building compiled params:

```
graph:    { v: [{ v: elementValue }, ...] }
compiled: { kind: 'fooArray', v: [elementValue, ...] }
```

Writing `{ v: compiledValue.v }` back to the graph produces `{ v: [elementValue, ...] }`, which fails the compiler's `'v' in item` check on the next load. `buildParams` silently drops the param, and the evaluator errors with "no static param".

**Rule:** When converting a compiled `Value` back to a graph param, check `Array.isArray(value.v)` and re-wrap each element as `{ v: element }`.

See `snapshotGraph()` in `src/graphEngine/graphEngine/graphEngine.ts` for the `valueToParam` helper.
