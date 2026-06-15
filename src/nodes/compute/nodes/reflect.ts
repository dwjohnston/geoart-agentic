import type { ResolvedValue } from '../../../schema/typeHelpers';
import { implementComputeNode } from '../implementComputeNode';

type ColorPoint = ResolvedValue<'colorPointValue'>;

function reflectPoint(p: ColorPoint, r: ColorPoint): ColorPoint {
  const mirrorDx = r.dx;
  const mirrorDy = r.dy;

  const len = Math.sqrt(mirrorDx * mirrorDx + mirrorDy * mirrorDy);
  const dnx = mirrorDx / len;
  const dny = mirrorDy / len;

  // Translate
  const px = p.x - r.x;
  const py = p.y - r.y;

  // Reflect position
  const dot = px * dnx + py * dny;

  // Reflect tangent (direction vector — no translation needed)
  const tdot = p.dx * dnx + p.dy * dny;

  return {
    x: 2 * dot * dnx - px + r.x,
    y: 2 * dot * dny - py + r.y,
    dx: 2 * tdot * dnx - p.dx,
    dy: 2 * tdot * dny - p.dy,
    r: p.r,
    g: p.g,
    b: p.b,
    a: p.a,
  };
}

const reflectNodeImplementation = implementComputeNode('reflect', {
  isTimeDependant: false,
  defaults: {
    inputPoints: [],
    reflectionPoints: [],
    colorShiftOperation: 'none' as const,
  },
  evaluate: (inputs) => {
    const points: ColorPoint[] = [];

    for (const rp of inputs.reflectionPoints) {
      const dx = rp.dx ?? 0;
      const dy = rp.dy ?? 0;
      if (dx === 0 && dy === 0) continue;

      for (const ip of inputs.inputPoints) {
        points.push(reflectPoint(ip, rp));
      }
    }

    return { points };
  },
});

export default reflectNodeImplementation;
