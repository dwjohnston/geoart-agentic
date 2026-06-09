Instructions for implementing nodes: 

## File Structure, export format
- Each defined node should have a single file in the appropriate `src/nodes/<nodeType>/nodes` folder. 
    - The node implementation should be a default export.
    - the file name should be `nodeName.ts` eg. `add.ts`, NOT `addNode.ts` or `add.node.ts`
    - Do not create 'helper' files along side it.
        - You can create helper functions if that is sensible. 
        - If it makes sense to test helper functions, they can be named exports. 


## Tests 
- Create a test for your node implmentation. Adopt a 'at least write one test' strategy. 
    - You do not need to write comprehensive tests. The user will prompt you for greater test coverage if needed.
    - If fixing a bug within the implementation of a node, then DO write a test would detect the buggy behaviour. 

In your tests you may be running into issues with typing the inputs of a node. 

Make use of Typescript's `satisfies` operator to safely get types to be in the shape that the function paremeters expect.

```
    const inputs = {
      intervalTicks: 1,
      mode: 'all-to-all',
      intervalMode: 'inside-out-and-forth',
      colorPointsA: [
        { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0, dy: 0 },
      ],
      colorPointsB: [
        { x: -0.75, y: 0, r: 0, g: 0, b: 1, a: 1, dx: 0, dy: 0 },
        { x: -0.25, y: 0, r: 0, g: 1, b: 0, a: 1, dx: 0, dy: 0 },
        { x: 0.25, y: 0, r: 1, g: 1, b: 0, a: 1, dx: 0, dy: 0 },
        { x: 0.75, y: 0, r: 0, g: 1, b: 1, a: 1, dx: 0, dy: 0 },
      ],
    } satisfies NodeInputsResolved<"timedLineArray">;;
```



    