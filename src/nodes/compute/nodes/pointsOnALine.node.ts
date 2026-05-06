import { implementComputeNode } from '../implementComputeNode';
import { pointsOnALine, type Sampler } from './pointsOnALine';

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
