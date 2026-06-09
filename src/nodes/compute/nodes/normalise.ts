import { UnreachableError } from '../../../common-tooling/errors/UnreachableError';
import type { V_normaliseModeEnumValue } from '../../../schema/_generated/value-kinds-2';
import { implementComputeNode } from '../implementComputeNode';

type ColorPoint = { x: number; y: number; dx: number; dy: number; r: number | null; g: number | null; b: number | null; a: number | null };

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function computeBBox(points: ColorPoint[]): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, maxX, minY, maxY };
}

function normaliseIntoCenter(
  inputPoints: ColorPoint[],
  center: { x: number; y: number },
  normalisationSize: number,
  strength: number,
): ColorPoint[] {
  if (inputPoints.length === 0) return [];

  const { minX, maxX, minY, maxY } = computeBBox(inputPoints);
  const bboxWidth = maxX - minX;
  const bboxHeight = maxY - minY;
  const maxDim = Math.max(bboxWidth, bboxHeight);
  const scale = maxDim === 0 ? 1 : normalisationSize / maxDim;
  const bboxCenterX = (minX + maxX) / 2;
  const bboxCenterY = (minY + maxY) / 2;

  return inputPoints.map((p) => ({
    ...p,
    x: lerp(p.x, center.x + (p.x - bboxCenterX) * scale, strength),
    y: lerp(p.y, center.y + (p.y - bboxCenterY) * scale, strength),
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

    const points = applyNormalise(
      inputPoints as ColorPoint[],
      normalisationCenters as ColorPoint[],
      normalisationSize,
      strength,
      mode,
    );

    return { points };
  },
});

function applyNormalise(
  inputPoints: ColorPoint[],
  centers: ColorPoint[],
  normalisationSize: number,
  strength: number,
  mode: V_normaliseModeEnumValue['v'],
): ColorPoint[] {
  if (centers.length === 0 || inputPoints.length === 0) {
    return mode === 'product' ? [] : [...inputPoints];
  }

  switch (mode) {
    case 'product': {
      const result: ColorPoint[] = [];
      for (const center of centers) {
        result.push(...normaliseIntoCenter(inputPoints, center, normalisationSize, strength));
      }
      return result;
    }
    case 'sequential': {
      let current = inputPoints;
      for (const center of centers) {
        current = normaliseIntoCenter(current, center, normalisationSize, strength);
      }
      return current;
    }
    default:
      throw new UnreachableError(mode);
  }
}

export { applyNormalise };
export default normaliseNodeImplementation;
