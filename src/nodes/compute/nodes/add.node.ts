import { defineComputeNode } from '../types';

export const addNodeDef = defineComputeNode("add", {
  isTimeDependant: false,
  evaluate: (inputs) => {
    const a = inputs.a.v;
    const b = inputs.b.v;
    return { sum: a + b };
  },
});
