import { defineComputeNode, } from '../defineComputeNode';

export const colorPointNodeDef = defineComputeNode('colorPointCompute', {
  defaults: {
    "color": {
      "v": {
        "a": 1,
        "r": 1,
        "g": 1,
        "b": 1
      },

    },
    point: {
      v: {
        x: 0,
        y: 0
      }
    }
  },

  evaluate(inputs) {
    const point = inputs.point;
    const color = inputs.color;
    return {
      colorPoint: {
        x: point.v.x,
        y: point.v.y,
        r: color.v.r,
        g: color.v.g,
        b: color.v.b,
        a: color.v.a,
      },
    };
  },
});
