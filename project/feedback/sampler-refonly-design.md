# Design Decision: refOnly Value Types

## Problem
The `samplerValue` type is fundamentally non-serialisable (it contains functions). It can only exist as a runtime computation object, never as a static JSON value.

## Solution
Rather than making samplerValue special at the schema level, introduce a general **`refOnly` flag** on value type definitions:

```json
"samplerValue": {
  "title": "Sampler Value",
  "refOnly": true,
  "description": "...",
  ...
}
```

## Semantics
- The type system and compiler treat refOnly types like any other type — they flow through graphs normally
- The constraint is **serialisation-only**: when saving a graph to JSON, if a node contains a static value of a refOnly type, serialisation fails (can't write a function)
- This acknowledges that refOnly types are valid at runtime but not persistable in JSON

## Benefits
- Cleaner than adding schema-level restrictions
- Scales to future refOnly types (e.g., other lazy-evaluation types)
- Runtime and type system are unrestricted; the JSON boundary is the only constraint
- No need to error at compile time — the issue is at the JSON boundary, not the type system

## Implementation
1. Add optional `refOnly: true` to value type definitions
2. Serialiser checks this flag and rejects static values of refOnly types
3. Code generation treats them normally
