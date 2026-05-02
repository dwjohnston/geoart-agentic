import { defineComputeNode } from '../defineComputeNode';

export const addNodeDef = defineComputeNode("add", {
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
});
