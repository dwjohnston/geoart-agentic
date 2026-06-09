# Geometric Art Engine

This project is a generative art engine. Graphs of connected nodes are evaluated each frame to produce animations drawn to a canvas.

## CONTEXT.md

If you are looking for CONTEXT.md, what you'll need is in `src/terminology.md`.

<!-- include: projectDocs/conventions/tooling.md -->

<!-- include: projectDocs/conventions/language.md -->

<!-- include: projectDocs/ai-instructions/agent_instructions.md -->

<!-- include: projectDocs/conventions/canonical_levels.md -->

<!-- include: projectDocs/architecture/conceptual_architecture.md -->

<!-- include: projectDocs/architecture/terminology.md -->

<!-- include: projectDocs/architecture/FILE_STRUCTURE.md -->

<!-- include: projectDocs/node-development/adding_a_new_node_type.md -->

## Sub Agents

Keep in mind the specific define/declare/implement terminology set out in the Terminology section.

The following sub agents are available to you.

### Definition Agents
- `schema-agent` — responsible for any _defining_ work: defining new value primitives, defining new nodes

### Implementation Agents
- `compute-node-agent` — responsible for _implementing_ compute nodes
- `render-node-agent` — responsible for _implementing_ render nodes
- `control-node-agent` — responsible for _implementing_ control nodes

### Declaration Agents
- `algorithm-agent` — responsible for _declaring_ new algorithms, including reference algorithms to prove a feature

Work should be delegated to agents. This reduces the context window of the operating agent and improves performance and efficiency.
