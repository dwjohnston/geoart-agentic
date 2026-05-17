import { implementComputeNode } from '../implementComputeNode';

const multiplierNodeDef = implementComputeNode("multiplier", {
  isTimeDependant: false,
  defaults: {
    a: 1,
    b: 1,
  },
  evaluate: (inputs) => {
    return { product: inputs.a * inputs.b };
  },
});

export default multiplierNodeDef;
