import type { ResolvedValue } from '../../../schema/typeHelpers';
import { implementComputeNode } from '../implementComputeNode';

type ColorPoint = ResolvedValue<'colorPointValue'>;

const DEFAULT_CENTER: ColorPoint = { x: 0, y: 0, r: 1, g: 1, b: 1, a: 1, dx: 0, dy: 0 };
const DEFAULT_ORIGIN: ColorPoint = { x: 0, y: -1, r: 1, g: 1, b: 1, a: 1, dx: 0, dy: 0 };

function normaliseToCenter(
  inputPoints: ColorPoint[],
  center: ColorPoint,
  origin: ColorPoint,
  normalisationSize: number,
  strength: number,
): ColorPoint[] {
  if (inputPoints.length === 0) return [];

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let sumX = 0, sumY = 0;

  for (const p of inputPoints) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
    sumX += p.x;
    sumY += p.y;
  }

  const cx = sumX / inputPoints.length;
  const cy = sumY / inputPoints.length;

  const maxDim = Math.max(maxX - minX, maxY - minY);
  const scale = maxDim > 0 ? normalisationSize / maxDim : 1;

  const dx = origin.x - center.x;
  const dy = origin.y - center.y;
  const theta = Math.PI / 2 - Math.atan2(dy, dx);
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  return inputPoints.map(p => {
    const rx = (p.x - cx) * scale;
    const ry = (p.y - cy) * scale;

    const rotX = rx * cosT - ry * sinT;
    const rotY = rx * sinT + ry * cosT;

    const finalX = rotX + center.x;
    const finalY = rotY + center.y;

    const pdx = p.dx ?? 0;
    const pdy = p.dy ?? 0;

    return {
      x: p.x + (finalX - p.x) * strength,
      y: p.y + (finalY - p.y) * strength,
      dx: pdx + (pdx * cosT - pdy * sinT - pdx) * strength,
      dy: pdy + (pdx * sinT + pdy * cosT - pdy) * strength,
      r: p.r,
      g: p.g,
      b: p.b,
      a: p.a,
    };
  });
}

const normalisePointsNodeDef = implementComputeNode('normalisePoints', {
  isTimeDependant: false,
  defaults: {
    inputPoints: [],
    normalisationCenters: [DEFAULT_CENTER],
    normalisationOrigin: [DEFAULT_ORIGIN],
    normalisationSize: 1,
    strength: 0,
  },
  evaluate: (inputs) => {
    const points: ColorPoint[] = [];

    for (const center of inputs.normalisationCenters) {
      for (const origin of inputs.normalisationOrigin) {
        const batch = normaliseToCenter(
          inputs.inputPoints,
          center,
          origin,
          inputs.normalisationSize,
          inputs.strength,
        );
        for (const p of batch) points.push(p);
      }
    }

    return { points };
  },
});

export default normalisePointsNodeDef;
