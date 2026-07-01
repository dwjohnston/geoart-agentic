import type { ResolvedValue } from '../../../schema/typeHelpers';
import { implementComputeNode } from '../implementComputeNode';

type ColorPoint = ResolvedValue<'colorPointValue'>;

type Bounds = { minX: number; maxX: number; minY: number; maxY: number };

function boundsOf(points: ColorPoint[]): Bounds {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  return { minX, maxX, minY, maxY };
}

/**
 * Fits `p` (relative to the input set's own bounding box) into a box of side
 * `normalisationSize` centred on `center`, oriented so the input set's local
 * "up" (+y) axis points toward `up` — the direction from `center` to the
 * normalisation origin.
 */
function normalisePoint(
  p: ColorPoint,
  localCenterX: number,
  localCenterY: number,
  scale: number,
  center: ColorPoint,
  upX: number,
  upY: number,
  strength: number,
): ColorPoint {
  const rightX = upY;
  const rightY = -upX;

  const lx = (p.x - localCenterX) * scale;
  const ly = (p.y - localCenterY) * scale;

  const normX = center.x + lx * rightX + ly * upX;
  const normY = center.y + lx * rightY + ly * upY;
  const normDx = p.dx * rightX + p.dy * upX;
  const normDy = p.dx * rightY + p.dy * upY;

  return {
    x: p.x + (normX - p.x) * strength,
    y: p.y + (normY - p.y) * strength,
    dx: p.dx + (normDx - p.dx) * strength,
    dy: p.dy + (normDy - p.dy) * strength,
    r: p.r,
    g: p.g,
    b: p.b,
    a: p.a,
  };
}

const normaliseNodeImplementation = implementComputeNode('normalise', {
  isTimeDependant: false,
  defaults: {
    inputPoints: [],
    normalisationCenters: [],
    normalisationOrigin: [],
    normalisationSize: 1,
    strength: 0,
  },
  evaluate: (inputs) => {
    const points: ColorPoint[] = [];

    if (inputs.inputPoints.length === 0) {
      return { points };
    }

    const strength = Math.max(0, Math.min(1, inputs.strength));

    const { minX, maxX, minY, maxY } = boundsOf(inputs.inputPoints);
    const localCenterX = (minX + maxX) / 2;
    const localCenterY = (minY + maxY) / 2;
    const maxDimension = Math.max(maxX - minX, maxY - minY);
    const scale = maxDimension > 1e-10 ? inputs.normalisationSize / maxDimension : 1;

    for (const center of inputs.normalisationCenters) {
      for (const origin of inputs.normalisationOrigin) {
        const upX = origin.x - center.x;
        const upY = origin.y - center.y;
        const len = Math.sqrt(upX * upX + upY * upY);
        if (len < 1e-10) continue;

        const normUpX = upX / len;
        const normUpY = upY / len;

        for (const ip of inputs.inputPoints) {
          points.push(
            normalisePoint(ip, localCenterX, localCenterY, scale, center, normUpX, normUpY, strength),
          );
        }
      }
    }

    return { points };
  },
});

export default normaliseNodeImplementation;
