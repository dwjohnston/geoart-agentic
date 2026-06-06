import { implementComputeNode } from '../implementComputeNode';

type ColorPoint = {
  x: number;
  y: number;
  r: number | null;
  g: number | null;
  b: number | null;
  a: number | null;
  dx?: number;
  dy?: number;
};

/**
 * Normalise an array of points to fit within a bounding box centred on a given center point.
 * Applies a strength lerp between original positions (0) and fully normalised positions (1).
 */
function normaliseToCenter(
  points: ColorPoint[],
  center: ColorPoint,
  normalisationSize: number,
  strength: number
): ColorPoint[] {
  if (points.length === 0) return [];

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

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const range = Math.max(maxX - minX, maxY - minY);
  const scale = range === 0 ? 1 : normalisationSize / range;

  return points.map((point) => {
    const nx = center.x + (point.x - cx) * scale;
    const ny = center.y + (point.y - cy) * scale;

    return {
      ...point,
      x: point.x + (nx - point.x) * strength,
      y: point.y + (ny - point.y) * strength,
    };
  });
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

    const clampedStrength = Math.max(0, Math.min(1, strength));

    if (normalisationCenters.length === 0) {
      return { points: inputPoints };
    }

    if (mode === 'sequential') {
      let current: ColorPoint[] = inputPoints;
      for (const center of normalisationCenters) {
        current = normaliseToCenter(current, center, normalisationSize, clampedStrength);
      }
      return { points: current };
    }

    // mode === 'product' (default)
    const results: ColorPoint[] = [];
    for (const center of normalisationCenters) {
      const normalised = normaliseToCenter(inputPoints, center, normalisationSize, clampedStrength);
      results.push(...normalised);
    }
    return { points: results };
  },
});

export default normaliseNodeImplementation;
