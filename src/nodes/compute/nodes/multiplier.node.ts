import { defineComputeNode } from '../defineComputeNode';

export const multiplierNodeDef = defineComputeNode("multiplier", {
  isTimeDependant: false,
  defaults: {
    a: 1,
    b: 1,
  },
  evaluate: (inputs) => {
    return { product: inputs.a * inputs.b };
  },
});
