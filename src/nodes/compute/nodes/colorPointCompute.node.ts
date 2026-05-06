import { implementComputeNode, } from '../implementComputeNode';

export const colorPointNodeDef = implementComputeNode('colorPointCompute', {
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
    },
    dx: 0,
    dy: 0,
  },

  evaluate(inputs) {
    const point = inputs.point;
    const color = inputs.color;
    const dx = inputs.dx ?? 0; // Default to 0 if not provided
    const dy = inputs.dy ?? 0;
    return {
      colorPoint: {
        x: point.x,
        y: point.y,
        r: color.r,
        g: color.g,
        b: color.b,
        a: color.a,
        dx: dx,
        dy: dy,
      },
    };
  },
});
