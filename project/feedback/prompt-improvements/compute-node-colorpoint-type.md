# Prompt improvement: compute-node skill — ColorPoint type confusion

## Problem

When implementing color logic for `reflect` and `rotate`, the compute-node skill spent many iterations re-deriving the `ColorPoint` type (`ResolvedValue<'colorPointValue'>`). It was unclear whether `r`, `g`, `b`, `a` were nullable, whether `dx`/`dy` were optional, and what the resolved shape looked like.

The skill reads `src/schema` only, but the generated type is in `src/schema/_generated/schema-types.d.ts` (gitignored). Reading `value-kinds.schema.json` gives the answer but requires knowing to look there.

## Suggested fix

Add a note to the compute-node skill prompt:

> **ColorPoint shape:** `ResolvedValue<'colorPointValue'>` resolves to  
> `{ x: number; y: number; r: number | null; g: number | null; b: number | null; a: number | null; dx?: number; dy?: number }`.  
> `r`, `g`, `b`, `a` are nullable (null means "ignore this channel"). `dx`, `dy` are optional non-null numbers. `x`, `y` are always numbers.

This avoids re-reading the schema to establish something that comes up in any node dealing with color.
