import { defineComputeNode } from '../types';
import { pointsOnALine } from './pointsOnALine';

export const pointsOnALineNodeDef = defineComputeNode("pointsOnALine", {
  isTimeDependant: false,
  defaults: {
    "pointA": {
      "v": {
        r: 1,
        g: 1,
        b: 1,
        a: 1,
        x: 1,
        y: 1,
      } as const
    },
    "pointB": {
      "v": {
        r: 1,
        g: 1,
        b: 1,
        a: 1,
        x: 1,
        y: 1,
      } as const
    },
    "numberOfPoints": {
      "v": 1
    }
  },
  evaluate: (inputs) => {
    const pointA = inputs.pointA.v;
    const pointB = inputs.pointB.v;
    const numberOfPoints = inputs.numberOfPoints.v;


    const points = pointsOnALine(pointA, pointB, numberOfPoints)
    return {
      points: points
    }

  },
});
