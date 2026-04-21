import type { NodeDef } from '../types';
import type { PointValue, ColorValue } from '../../../graph/types';

export const colorPointNodeDef: NodeDef = {
  type: 'colorPoint',
  inputs: [
    { name: 'point', type: 'point', default: { kind: 'point', v: { x: 0, y: 0 } } },
    { name: 'color', type: 'color', default: { kind: 'color', v: { r: 1, g: 1, b: 1, a: 1 } } },
  ],
  outputs: [
    { name: 'colorPoint', type: 'colorPoint' },
  ],
  evaluate(inputs) {
    const point = inputs[0] as PointValue;
    const color = inputs[1] as ColorValue;
    return [{
      kind: 'colorPoint',
      v: {
        x: point.v.x,
        y: point.v.y,
        r: color.v.r,
        g: color.v.g,
        b: color.v.b,
        a: color.v.a,
      },
    }];
  },
};
