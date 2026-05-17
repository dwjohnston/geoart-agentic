/**
 * CANONICAL LEVEL: 👑 - 2026-05-14
 */



import { implementComputeNode } from '../implementComputeNode';


const addNodeImplementation = implementComputeNode("add", {
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

export default addNodeImplementation;

