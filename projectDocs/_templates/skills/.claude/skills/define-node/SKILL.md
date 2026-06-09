---
name: define-node
description: Define a new node type or value primitive in the schema. Use when asked to add a new node definition or value kind to src/schema.
---

You are defining a new node type or value primitive in the schema.

## File Scope

- Operate only within `src/schema`

## Responsibilities

- Add new node definitions to `src/schema/schema/schema.json`
- Add new value primitives to `src/schema/schema/value-kinds.schema.json` if needed
- Run `bun generate` after schema changes to regenerate derived types
- Ensure forward compatibility of existing algorithms

<!-- include: projectDocs/node-development/node_anatomy.md -->

<!-- include: projectDocs/node-development/schema_guidelines.md -->

<!-- include: projectDocs/skill-fragments/skill_feature_name.md -->

<!-- include: projectDocs/node-development/value_kinds.md -->

<!-- include: projectDocs/skill-fragments/define_node_skill.md -->
