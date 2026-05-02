1. Create an adapter around `node.evaluate` so that I can write the tests in the way I want. 


    - It will both transfrom the inputs _from_ the legacy format, and the output _to_ the legacy format. 


Do I rename the existing function `defineXNodeLegacy` and then create a new one called `defineXNode`. So our existing code is using `defineXNodeLegacy` but we can write the tests in the format we want. 

2. Write tests for circle.node etc.


3. Refactor `compile` function. Include the registry of nodes as an input, rather than import. 

4a. Fixing the compile function will probably just be a matter of changing these lines: 

https://github.com/dwjohnston/geoart-agentic/blob/0c35f4f796d516faf4532abec3cff2da2665d63d/src/graph/evaluator.ts#L154-L162

BUT, the problem is going to be that all the types are going to be messed up. 

So: what we can do is do the quick inline fix just validate the structural change, ignoring the type errors. 
(That will be, do the inline fix, and also change the registries to use the non-legacy defineXNode).


4b. 

But also do the full refactor - taking a 'delete and start again' approach. 

Luckily the external API of the compile and evalute functions are how we need them. Except maybe this: 

```
  cache: Map<string, Value[]>,
```

Still that only exists as an interal value, so. 


This can be done as a `compiler2` and `evaluator2` function. 
Infact, I don't know if `compiler` even needs to change? 

Compiler returns a shape like that: 

```
export type CompiledGraph = {
  /** Node IDs in topological order (sources first). */
  sortedNodes: string[];
  nodes: Map<string, CompiledNode>;
  /** Internal edges derived from inline param refs. */
  edges: Edge[];
  states: Map<string, NodeState>;
};
```

In this, any type association is lost - we can't know what the shape of a given nodes is by referencing by id. 

But I think this is OK - that part where we actually care about the typings is actually just when we we are declaring the the node definitions. 


