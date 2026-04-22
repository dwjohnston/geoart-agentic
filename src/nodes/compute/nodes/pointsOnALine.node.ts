import type { NodeDef } from '../types';
import type { Value, ColorPointValue, NumberValue, ColorPointArrayValue } from '../../../graph/types';
import { pointsOnALine } from './pointsOnALine';

export const pointsOnALineNodeDef: NodeDef = {
  type: 'pointsOnALine',
  isTimeDependant: false,
  inputs: [
    {
      name: 'pointA',
      type: 'colorPoint',
      default: { kind: 'colorPoint', v: { x: 0, y: 0, r: 1, g: 1, b: 1, a: 1 } },
    },
    {
      name: 'pointB',
      type: 'colorPoint',
      default: { kind: 'colorPoint', v: { x: 1, y: 0, r: 1, g: 1, b: 1, a: 1 } },
    },
    {
      name: 'numberOfPoints',
      type: 'number',
      default: { kind: 'number', v: 5 },
    },
  ],
  outputs: [
    { name: 'points', type: 'colorPointArray' },
  ],
  evaluate(inputs: Value[]): Value[] {
    const pointA = (inputs[0] as ColorPointValue).v;
    const pointB = (inputs[1] as ColorPointValue).v;
    const numberOfPoints = (inputs[2] as NumberValue).v;
    const result = pointsOnALine(pointA, pointB, numberOfPoints);
    return [{ kind: 'colorPointArray', v: result } satisfies ColorPointArrayValue];
  },
};
