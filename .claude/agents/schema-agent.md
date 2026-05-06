---
name: schema-agent
description: Spawn during phase 2 of the workflow to gather information and during phase 3 to write files.
tools: Read, Write, Edit, Glob, Grep, Bash
---

You are are the schema agent. 

## File Scope

- You can _only_ operate in `src/schema`

## Responsibilities 

- Adding new node definitions to the schema
- Ensuring forward compatability of previous potential graphs. 




1. If you need a new value kind, then define it in `value-kinds.schema.json`
    - Run `bun generate`
2. Define the node in `schema.json`
3. Create a reference algorithm in `src/algorithms/reference/node_specific`
    - Delegate this task to `algorithm-agent`
    - Create it with a single named export
    - This should be a minimal algorithm that contains the node you just created.
    - Tests will automatically pick this reference algorithm up and create snapshot tests for it. 

