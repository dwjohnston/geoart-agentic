import { defineComputeNode } from '../types';

export const addNodeDef = defineComputeNode("add", {
  isTimeDependant: false,
  defaults: {
    a: { v: 0 },
    b: { v: 0 }
  },
  evaluate: (inputs) => {
    const a = inputs.a.v;
    const b = inputs.b.v;
    return { sum: a + b };
  },
});
