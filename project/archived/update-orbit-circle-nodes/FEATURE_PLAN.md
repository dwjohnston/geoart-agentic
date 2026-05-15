# Feature Plan: Update Orbit Node — Multi-Centre Support

## Status Panel

| Task | Agent | Status |
|------|-------|--------|
| 01 — Deprecate `center`, add `centerPoints` to schema | schema-agent | TODO |
| 02 — Implement multi-centre orbit logic | compute-node-agent | TODO |
| 03 — Reference algorithm | algorithm-agent | TODO |

---

## Dependency Graph

```
Task 01 (schema-agent)
    └── Task 02 (compute-node-agent)
            └── Task 03 (algorithm-agent)
```

Tasks must run sequentially — each depends on the previous.

---

## Task Summaries

### Task 01 — Schema Agent

File: `task_01_schema-agent_deprecate-center-add-centerPoints.md`

Update `src/schema/schema/schema.json` — orbit compute node definition:
- Mark `center` param as `deprecated: true` with a deprecation description
- Add `centerPoints` param referencing `colorPointArrayValueOrRef`
- Run `bun generate` to regenerate TypeScript typings
- No new value kinds needed

### Task 02 — Compute Node Agent

File: `task_02_compute-node-agent_implement-multi-centre-orbit.md`

Update the orbit node implementation:
- Resolve centre inputs: `centerPoints` takes precedence over `center`, with a fallback default
- For each centre point, run the existing orbit maths; inherit colour from the centre point
- Flatten all orbit results into the `points` output
- Return `points[0]` for the deprecated `point` output

### Task 03 — Algorithm Agent

File: `task_03_algorithm-agent_reference-algorithm.md`

Create a minimal reference algorithm in `src/algorithms/reference/node_specific/` that:
- Uses `orbit` with a `centerPoints` array of 2+ static colour points
- Wires `points` output to a render node
- Is auto-picked up by the snapshot test suite
