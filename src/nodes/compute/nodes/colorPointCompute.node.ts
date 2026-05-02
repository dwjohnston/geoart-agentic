import { defineComputeNode, } from '../defineComputeNode';

export const colorPointNodeDef = defineComputeNode('colorPointCompute', {
  defaults: {
    "color": {
      "a": 1,
      "r": 1,
      "g": 1,
      "b": 1
    },
    point: {
      x: 0,
      y: 0
    }
  },

  evaluate(inputs) {
    const point = inputs.point;
    const color = inputs.color;
    return {
      colorPoint: {
        x: point.x,
        y: point.y,
        r: color.r,
        g: color.g,
        b: color.b,
        a: color.a,
      },
    };
  },
});
