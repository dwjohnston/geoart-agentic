# Schema Clean Up — Execution Plan

## Status

| Task | Agent | Status |
|---|---|---|
| Remove unimplemented node types from schema | schema-file-agent | done |

## Dependency Graph

```
[Task 1: Remove nodes from schema]
```

Single task, no dependencies.

## Tasks

### Task 1 — Remove unimplemented node types from schema

**Agent:** `schema-file-agent`

**Prompt:**

Edit `src/schema/schema.json` to remove the following node type definitions, which have no corresponding runtime implementation:

- **Control:** `toggle` — remove its `oneOf` branch from the `controlNode` definition.
- **Compute:** `scale` — remove its `oneOf` branch from the `computeNode` definition.
- **Render:** `correspondingLines` — remove its `oneOf` branch from the `renderNode` definition.

Do not change anything else. Do not add or modify any other node definitions. Do not change the schema version.

After editing, verify the file is valid JSON.
