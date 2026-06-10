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
 * Cosine of the angle between the input point's velocity and the direction to the target.
 * Returns 1 if the input has no velocity (degrades to proximity behaviour).
 */
function directionalFactor(
  inputPoint: ResolvedValue<'colorPointValue'>,
  targetPoint: ResolvedValue<'colorPointValue'>
): number {
  const vx = inputPoint.dx ?? 0;
  const vy = inputPoint.dy ?? 0;
  const velMag = Math.sqrt(vx * vx + vy * vy);
  if (velMag < 1e-10) return 1;

  const toX = targetPoint.x - inputPoint.x;
  const toY = targetPoint.y - inputPoint.y;
  const toMag = Math.sqrt(toX * toX + toY * toY);
  if (toMag < 1e-10) return 1;

  return (vx / velMag) * (toX / toMag) + (vy / velMag) * (toY / toMag);
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

  let totalWeight = 0;
  let weightedShift = 0;

  for (const target of validTargets) {
    const dist = distance(inputPoint, target);
    const weight = inverseDistanceWeight(dist, falloff);
    const dirFactor = mode === 'proximity-with-direction'
      ? directionalFactor(inputPoint, target)
      : 1;
    totalWeight += weight;
    weightedShift += weight * dirFactor * ((target[channel] as number) - inputValue);
  }

  if (totalWeight <= 0) return inputValue;

  const shift = weightedShift / totalWeight;
  const influence = totalWeight / (totalWeight + 1);
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
