import { defineComputeNode } from '../defineComputeNode';

export const multiplierNodeDef = defineComputeNode("multiplier", {
  isTimeDependant: false,
  defaults: {
    a: {
      v: 1,
    },
    b: {
      v: 1
    }
  },
  evaluate: (inputs) => {
    return { product: inputs.a.v * inputs.b.v };
  },
});
