

1. If you need a new value kind, then define it in `value-kinds.schema.json`
    - Run `bun generate`
2. Define the node in `schema.json`
3. Create a reference algorithm in `src/algorithms/reference/node_specific`
    - Create it with a single named export
    - This should be a minimal algorithm that contains the node you just created.
    - Tests will automatically pick this reference algorithm up and create snapshot tests for it. 

