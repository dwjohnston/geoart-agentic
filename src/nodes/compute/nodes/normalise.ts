import type { ResolvedValue } from '../../../schema/typeHelpers';
import { implementComputeNode } from '../implementComputeNode';

type ColorPoint = ResolvedValue<'colorPointValue'>;
type BoundingBox = { minX: number; maxX: number; minY: number; maxY: number };

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function boundingBox(points: ColorPoint[]): BoundingBox {
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
 * Fits `inputPoints` into a `size`-sided box centred on `center`, rotated so
 * the shape's own "up" (+y) direction points toward `origin`. Returns null
 * when `origin` coincides with `center` — the up direction is undefined.
 */
function normalisePointsTowards(
  inputPoints: ColorPoint[],
  center: ColorPoint,
  origin: ColorPoint,
  size: number,
  strength: number
): ColorPoint[] | null {
  const dirX = origin.x - center.x;
  const dirY = origin.y - center.y;
  const dirLen = Math.sqrt(dirX * dirX + dirY * dirY);
  if (dirLen === 0) return null;

  const dx = dirX / dirLen;
  const dy = dirY / dirLen;

  // Rotation mapping "up" (0, 1) onto the (dx, dy) direction.
  const theta = Math.atan2(-dx, dy);
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

  const originalBox = boundingBox(inputPoints);
  const pivotX = (originalBox.minX + originalBox.maxX) / 2;
  const pivotY = (originalBox.minY + originalBox.maxY) / 2;

  const rotated = inputPoints.map((p) => {
    const relX = p.x - pivotX;
    const relY = p.y - pivotY;
    return {
      ...p,
      x: relX * cos - relY * sin + pivotX,
      y: relX * sin + relY * cos + pivotY,
      dx: p.dx * cos - p.dy * sin,
      dy: p.dx * sin + p.dy * cos,
    };
  });

  const rotatedBox = boundingBox(rotated);
  const maxDim = Math.max(rotatedBox.maxX - rotatedBox.minX, rotatedBox.maxY - rotatedBox.minY);
  const scale = maxDim === 0 ? 1 : size / maxDim;
  const boxCenterX = (rotatedBox.minX + rotatedBox.maxX) / 2;
  const boxCenterY = (rotatedBox.minY + rotatedBox.maxY) / 2;

  return rotated.map((p, i) => {
    const normalisedX = (p.x - boxCenterX) * scale + center.x;
    const normalisedY = (p.y - boxCenterY) * scale + center.y;
    const normalisedDx = p.dx * scale;
    const normalisedDy = p.dy * scale;

    const original = inputPoints[i];
    return {
      ...original,
      x: lerp(original.x, normalisedX, strength),
      y: lerp(original.y, normalisedY, strength),
      dx: lerp(original.dx, normalisedDx, strength),
      dy: lerp(original.dy, normalisedDy, strength),
    };
  });
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
    const strength = Math.max(0, Math.min(1, inputs.strength));

    if (inputs.inputPoints.length > 0) {
      for (const center of inputs.normalisationCenters) {
        for (const origin of inputs.normalisationOrigin) {
          const normalised = normalisePointsTowards(
            inputs.inputPoints,
            center,
            origin,
            inputs.normalisationSize,
            strength
          );
          if (normalised === null) continue;
          points.push(...normalised);
        }
      }
    }

    return { points };
  },
});

export default normaliseNodeImplementation;
