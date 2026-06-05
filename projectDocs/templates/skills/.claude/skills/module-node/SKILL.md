---
name: module-node
description: Implement a module node. Use when asked to implement a module that has already been defined in the schema.
---

You are implementing a module node.

## File Scope

- Read from `src/schema` only
- Write only to `src/nodes/module`

## Responsibilities

- Implement the module's `provideNodes` function
- Wire internal nodes via the input marker pattern
- Write tests

<!-- include: projectDocs/node_anatomy.md#Modules -->

<!-- include: projectDocs/skill_feature_name.md -->

<!-- include: projectDocs/skill_input_handoff.md -->

<!-- include: projectDocs/module_node_skill.md -->
