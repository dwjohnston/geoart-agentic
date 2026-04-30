## Adding a New Node Type

1. Define the node in `schema.json`
    - If you need a new value type, define it in `value-kinds.schema.json` first
2. Implement the node in the appropriate `src/nodes/[compute|control|render]/nodes/` folder using the `define*Node` function — see [Node Anatomy](node_anatomy.md)
    - Set port defaults that produce visible output with no params wired — see [Sensible Defaults](sensible_defaults.md)
3. Register it in that layer's `registry.ts`

