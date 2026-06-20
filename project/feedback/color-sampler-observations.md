# color-sampler — Session Observations

## Type casting for runtime-only value kinds

`colorSamplerValue` (and `samplerValue`) are typed as `unknown` in the generated schema types because they are runtime-only placeholders. Nodes that receive these as inputs must cast them:

```typescript
const sampler = inputs.colorSampler as ColorSampler | null
```

Task 05 had to fix a pre-existing version of this in `pointsOnALine.ts` while adding the orbit implementation. This pattern should be documented in the `compute-node` skill prompt so agents don't forget to cast.

## Reference algorithm: use raw compute node, not module node

The `colorSamplerReferenceGraph` uses the raw `orbit` compute node (not `orbit-module`) to access the `colorSampler` input port. Module nodes wrap compute nodes and may not expose all input ports. When writing reference algorithms that use optional inputs added to compute nodes, prefer the raw compute node.

## Parallel subagent execution

Tasks 02, 03, 04 ran in parallel as subagents without conflict. Tasks 05, 06 also ran cleanly in parallel. The dependency graph in `FEATURE_PLAN.md` was accurate and the parallelisation worked well.
