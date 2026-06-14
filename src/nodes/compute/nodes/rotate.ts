import type { ResolvedValue } from '../../../schema/typeHelpers';
import { implementComputeNode } from '../implementComputeNode';

type ColorPoint = ResolvedValue<'colorPointValue'>;

function rotatePoint(p: ColorPoint, center: ColorPoint, theta: number): ColorPoint {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

  const relX = p.x - center.x;
  const relY = p.y - center.y;

  return {
    x: relX * cos - relY * sin + center.x,
    y: relX * sin + relY * cos + center.y,
    dx: p.dx * cos - p.dy * sin,
    dy: p.dx * sin + p.dy * cos,
    r: p.r,
    g: p.g,
    b: p.b,
    a: p.a,
  };
}

const rotateNodeImplementation = implementComputeNode('rotate', {
  isTimeDependant: false,
  defaults: {
    inputPoints: [],
    rotationCenters: [],
    rotationAmount: 0,
  },
  evaluate: (inputs) => {
    const theta = inputs.rotationAmount * 2 * Math.PI;
    const points: ColorPoint[] = [];

    for (const center of inputs.rotationCenters) {
      for (const p of inputs.inputPoints) {
        points.push(rotatePoint(p, center, theta));
      }
    }

    return { points };
  },
});

export default rotateNodeImplementation;
