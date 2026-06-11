import type { ResolvedValue } from '../../../schema/typeHelpers';
import { implementComputeNode } from '../implementComputeNode';

type ColorShiftMode = 'proximity' | 'proximity-with-direction';

function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function inverseDistanceWeight(dist: number, falloff: number): number {
  if (dist < 1e-10) {
    return 1e10;
  }
  return 1 / Math.pow(dist, falloff);
}

/**
 * Signed [-1, 1] factor based on alignment of the two direction vectors.
 * +1 when facing the same direction → blend toward target colour.
 * -1 when facing opposite directions → blend away from target colour.
 */
function directionalFactor(
  inputPoint: ResolvedValue<'colorPointValue'>,
  targetPoint: ResolvedValue<'colorPointValue'>
): number {
  const ix = inputPoint.dx ?? 0;
  const iy = inputPoint.dy ?? 0;
  const iMag = Math.sqrt(ix * ix + iy * iy);

  const tx = targetPoint.dx ?? 0;
  const ty = targetPoint.dy ?? 0;
  const tMag = Math.sqrt(tx * tx + ty * ty);

  if (iMag < 1e-10 || tMag < 1e-10) return 1;

  return (ix / iMag) * (tx / tMag) + (iy / iMag) * (ty / tMag);
}

function blendChannel(
  inputValue: number | null,
  inputPoint: ResolvedValue<'colorPointValue'>,
  targetPoints: ResolvedValue<'colorPointArrayValue'>,
  falloff: number,
  strength: number,
  channel: 'r' | 'g' | 'b' | 'a',
  mode: ColorShiftMode
): number | null {
  if (inputValue === null) {
    return null;
  }

  const validTargets = targetPoints.filter((t) => t[channel] !== undefined && t[channel] !== null);

  if (validTargets.length === 0) {
    return inputValue;
  }

  for (const target of validTargets) {
    const dist = distance(inputPoint, target);
    if (dist < 1e-10) {
      return target[channel] as number;
    }
  }

  let totalProximityWeight = 0;
  let weightedShift = 0;

  for (const target of validTargets) {
    const dist = distance(inputPoint, target);
    const proximityWeight = inverseDistanceWeight(dist, falloff);
    const dirFactor = mode === 'proximity-with-direction'
      ? directionalFactor(inputPoint, target)
      : 1;
    // Anti-aligned alpha: fade toward transparent — (target.a - input.a) would be zero
    // when both are 1, so we need a different target value here.
    const targetValue = (mode === 'proximity-with-direction' && dirFactor < 0 && channel === 'a')
      ? 0
      : (target[channel] as number);
    const effectiveDirFactor = (mode === 'proximity-with-direction' && dirFactor < 0 && channel === 'a')
      ? Math.abs(dirFactor)
      : dirFactor;

    totalProximityWeight += proximityWeight;
    weightedShift += proximityWeight * effectiveDirFactor * (targetValue - inputValue);
  }

  if (totalProximityWeight <= 0) return inputValue;

  const shift = weightedShift / totalProximityWeight;
  const influence = totalProximityWeight / (totalProximityWeight + 1);
  return inputValue + shift * influence * strength;
}

const colorShiftNodeImplementation = implementComputeNode('colorShift', {
  isTimeDependant: false,
  defaults: {
    inputPoints: [],
    targetPoints: [],
    falloff: 1,
    strength: 1,
    mode: 'proximity',
  },
  evaluate: (inputs) => {
    const inputPoints = inputs.inputPoints;
    const targetPoints = inputs.targetPoints;
    const falloff = inputs.falloff;
    const strength = inputs.strength;
    const mode = (inputs.mode ?? 'proximity') as ColorShiftMode;

    const clampedStrength = Math.max(0, Math.min(1, strength));

    const points = inputPoints.map((inputPoint) => {
      return {
        ...inputPoint,
        r: blendChannel(inputPoint.r, inputPoint, targetPoints, falloff, clampedStrength, 'r', mode),
        g: blendChannel(inputPoint.g, inputPoint, targetPoints, falloff, clampedStrength, 'g', mode),
        b: blendChannel(inputPoint.b, inputPoint, targetPoints, falloff, clampedStrength, 'b', mode),
        a: blendChannel(inputPoint.a, inputPoint, targetPoints, falloff, clampedStrength, 'a', mode),
      };
    });

    return {
      points,
    };
  },
});

export default colorShiftNodeImplementation;
