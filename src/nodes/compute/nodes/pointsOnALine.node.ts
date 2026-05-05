import { defineComputeNode } from '../defineComputeNode';
import { pointsOnALine, type Sampler } from './pointsOnALine';

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
    "numberOfPoints": 1,
    "modulateBy": null
  },
  evaluate: (inputs) => {
    const pointA = inputs.pointA;
    const pointB = inputs.pointB;
    const numberOfPoints = inputs.numberOfPoints;
    const modulateBy = inputs.modulateBy as Sampler | null;


    const points = pointsOnALine(pointA, pointB, numberOfPoints, modulateBy)
    return {
      points: points
    }

  },
});
