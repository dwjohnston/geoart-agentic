import { implementComputeNode } from '../implementComputeNode';


export const addNodeImplementation = implementComputeNode("add", {
  isTimeDependant: false,
  defaults: {
    a: 0,
    b: 0
  },
  evaluate: (inputs) => {
    const a = inputs.a;
    const b = inputs.b;
    return { sum: a + b };
  },
})

