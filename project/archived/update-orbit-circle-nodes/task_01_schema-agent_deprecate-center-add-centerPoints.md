# Task 01 — Schema: Deprecate `center`, Add `centerPoints` to Orbit Node

**Agent:** schema-agent
**Status:** TODO

## Goal

Update the `orbit` compute node definition in `src/schema/schema/schema.json`.

No new value kinds are needed — `colorPointArrayValueOrRef` already exists.

## Changes Required

In the `Orbit Compute Node` definition inside `definitions.computeNode.oneOf`:

1. Mark the existing `center` param as deprecated:
   - Add `"deprecated": true`
   - Add `"description": "DEPRECATED: use centerPoints instead"`
   - Keep the `$ref` to `pointValueOrRef` unchanged

2. Add a new `centerPoints` param alongside `center`:
   ```json
   "centerPoints": {
     "deprecated": false,
     "description": "Array of centre points. One orbit is generated per centre; all output points are flattened into the points output. Takes precedence over center.",
     "$ref": "refable-value-kinds.schema.json#/definitions/colorPointArrayValueOrRef"
   }
   ```

No changes to `x-outputs` — the existing `point` (deprecated) and `points` outputs remain as-is.

After editing the schema, run `bun generate` to regenerate TypeScript typings.

## Acceptance Criteria

- Schema validates with `bun run validate` (or equivalent)
- `colorPointArrayValueOrRef` is used for `centerPoints` — consistent with how other array inputs are defined
- `center` param still present, marked deprecated
- TypeScript types regenerated successfully
