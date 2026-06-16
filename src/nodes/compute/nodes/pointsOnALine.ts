import type { ResolvedValue } from "../../../schema/typeHelpers";
import { implementComputeNode } from '../implementComputeNode';

function pointsOnALine(
  pointA: ResolvedValue<"colorPointValue">,
  pointB: ResolvedValue<"colorPointValue">,
  numberOfPoints: number,
): ResolvedValue<"colorPointValue">[] {
  const count = Math.max(1, Math.round(numberOfPoints));
  if (count === 1) return [{ ...pointA }];
  const lerpChannel = (a: number | null, b: number | null, t: number) =>
    a === null || b === null ? null : a + t * (b - a);
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    return {
      x: pointA.x + t * (pointB.x - pointA.x),
      y: pointA.y + t * (pointB.y - pointA.y),
      r: lerpChannel(pointA.r, pointB.r, t),
      g: lerpChannel(pointA.g, pointB.g, t),
      b: lerpChannel(pointA.b, pointB.b, t),
      a: lerpChannel(pointA.a, pointB.a, t),
      dx: pointB.x - pointA.x,
      dy: pointB.y - pointA.y,
    };
  });
}

const pointsOnALineNodeImplementation = implementComputeNode("pointsOnALine", {
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
    "colorSampler": null,
  },
  evaluate: (inputs) => {
    const points = pointsOnALine(inputs.pointA, inputs.pointB, inputs.numberOfPoints)
    return {
      points: points
    }

  },
});

export default pointsOnALineNodeImplementation;
