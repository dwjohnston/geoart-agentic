import { defineComputeNode } from '../defineComputeNode';
import { pointsOnALine } from './pointsOnALine';

export const pointsOnALineNodeDef = defineComputeNode("pointsOnALine", {
  isTimeDependant: false,
  defaults: {
    "pointA": {
      r: 1,
      g: 1,
      b: 1,
      a: 1,
      x: 1,
      y: 1,
    } as const,
    "pointB": {
      r: 1,
      g: 1,
      b: 1,
      a: 1,
      x: 1,
      y: 1,
    } as const,
    "numberOfPoints": 1
  },
  evaluate: (inputs) => {
    const pointA = inputs.pointA;
    const pointB = inputs.pointB;
    const numberOfPoints = inputs.numberOfPoints;


    const points = pointsOnALine(pointA, pointB, numberOfPoints)
    return {
      points: points
    }

  },
});
