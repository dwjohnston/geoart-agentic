import type { ResolvedValue } from '../../../schema/typeHelpers';
import { implementComputeNode } from '../implementComputeNode';

function normalisePoints(
  points: ResolvedValue<'colorPointArrayValue'>,
  cx: number,
  cy: number,
  size: number,
  strength: number
): ResolvedValue<'colorPointArrayValue'> {
  let minX = points[0].x, maxX = points[0].x;
  let minY = points[0].y, maxY = points[0].y;

  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const bbCx = (minX + maxX) / 2;
  const bbCy = (minY + maxY) / 2;
  const maxDim = Math.max(maxX - minX, maxY - minY);
  const scale = maxDim > 0 ? size / maxDim : 1;

  return points.map(p => ({
    ...p,
    x: p.x + ((p.x - bbCx) * scale + cx - p.x) * strength,
    y: p.y + ((p.y - bbCy) * scale + cy - p.y) * strength,
  }));
}

const normaliseNodeImplementation = implementComputeNode('normalise', {
  isTimeDependant: false,
  defaults: {
    inputPoints: [],
    normalisationCenters: [],
    normalisationSize: 1,
    strength: 0,
    mode: 'product',
  },
  evaluate: (inputs) => {
    const { inputPoints, normalisationCenters, normalisationSize, strength, mode } = inputs;
    const s = Math.max(0, Math.min(1, strength));

    if (inputPoints.length === 0 || normalisationCenters.length === 0) {
      return { points: inputPoints };
    }

    if (mode === 'product') {
      return {
        points: normalisationCenters.flatMap(center =>
          normalisePoints(inputPoints, center.x, center.y, normalisationSize, s)
        ),
      };
    }

    // sequential: reapply normalisation for each center in sequence
    let current = inputPoints;
    for (const center of normalisationCenters) {
      current = normalisePoints(current, center.x, center.y, normalisationSize, s);
    }
    return { points: current };
  },
});

export default normaliseNodeImplementation;
