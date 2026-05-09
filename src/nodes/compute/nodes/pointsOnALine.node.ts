import { implementComputeNode } from '../implementComputeNode';
import { pointsOnALine } from './pointsOnALine';

export const pointsOnALineNodeDef = implementComputeNode("pointsOnALine", {
  isTimeDependant: false,
  defaults: {
    "pointA": {
      r: 1,
      g: 1,
      b: 1,
      a: 1,
      x: 1,
      y: 1,
      dx: 0,
      dy: 0,
    },
    "pointB": {
      r: 1,
      g: 1,
      b: 1,
      a: 1,
      x: 1,
      y: 1,
      dx: 0,
      dy: 0,
    },
    "numberOfPoints": 1,
  },
  evaluate: (inputs) => {
    const points = pointsOnALine(inputs.pointA, inputs.pointB, inputs.numberOfPoints)
    return {
      points: points
    }

  },
});
