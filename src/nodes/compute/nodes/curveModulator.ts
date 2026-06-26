import type { ResolvedValue } from '../../../schema/typeHelpers';
import { implementComputeNode } from '../implementComputeNode';
import type { Sampler } from '../../../schema/typeHelpers';

function calculateArrayLengthT(curve: ResolvedValue<'colorPointArrayValue'>): number[] {
  if (curve.length <= 1) return curve.map(() => 0);
  return curve.map((_, i) => i / (curve.length - 1));
}

function calculateLinearTotalT(curve: ResolvedValue<'colorPointArrayValue'>): number[] {
  if (curve.length === 0) return [];
  if (curve.length === 1) return [0];

  const distances: number[] = [0];
  for (let i = 1; i < curve.length; i++) {
    const dx = curve[i].x - curve[i - 1].x;
    const dy = curve[i].y - curve[i - 1].y;
    distances.push(distances[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }

  const totalDistance = distances[distances.length - 1];
  return totalDistance === 0
    ? distances.map(() => 0)
    : distances.map(d => d / totalDistance);
}

function calculateLinearOneT(curve: ResolvedValue<'colorPointArrayValue'>): number[] {
  if (curve.length === 0) return [];
  if (curve.length === 1) return [0];

  const distances: number[] = [0];
  for (let i = 1; i < curve.length; i++) {
    const dx = curve[i].x - curve[i - 1].x;
    const dy = curve[i].y - curve[i - 1].y;
    distances.push(distances[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }

  return distances;
}


const curveModulatorNodeImplementation = implementComputeNode('curveModulator', {
  defaults: {
    curve: [],
    modulator: null,
    cycleLengthMode: 'arrayLength',
    modulationAngle: 0.25,
    fixedOffset: 0,
  },
  evaluate: (inputs) => {
    const curve = inputs.curve
    const modulator = inputs.modulator as Sampler | null;
    const cycleLengthMode = inputs.cycleLengthMode;
    const modulationAngle = inputs.modulationAngle;
    const fixedOffset = inputs.fixedOffset;

    if (!curve || curve.length === 0) {
      // No curve: pass through unchanged
      return { points: curve };
    }

    // Calculate t values based on cycle length mode
    const tValues = cycleLengthMode === 'linearOne'
      ? calculateLinearOneT(curve)
      : cycleLengthMode === 'linearTotal'
        ? calculateLinearTotalT(curve)
        : calculateArrayLengthT(curve);

    // First pass: displace each point based on input tangent and parameters
    const displacedCurve = curve.map((point, i) => {
      const t = tValues[i];
      const dx = point.dx ?? 0;
      const dy = point.dy ?? 0;
      const tangentMag = Math.sqrt(dx * dx + dy * dy);

      let offsetX = 0;
      let offsetY = 0;

      if (tangentMag > 0) {
        const normalizedDx = dx / tangentMag;
        const normalizedDy = dy / tangentMag;
        const angleRad = -modulationAngle * 2 * Math.PI;

        // Rotate tangent by modulationAngle
        const rotatedX = normalizedDx * Math.cos(angleRad) - normalizedDy * Math.sin(angleRad);
        const rotatedY = normalizedDx * Math.sin(angleRad) + normalizedDy * Math.cos(angleRad);

        // Apply modulator displacement in rotated direction
        if (modulator) {
          const displacement = modulator.sample(t);
          offsetX += rotatedX * displacement;
          offsetY += rotatedY * displacement;
        }

        // Apply fixed offset in rotated direction
        if (fixedOffset !== 0) {
          offsetX += rotatedX * fixedOffset;
          offsetY += rotatedY * fixedOffset;
        }
      }

      return {
        x: point.x + offsetX,
        y: point.y + offsetY,
        r: point.r,
        g: point.g,
        b: point.b,
        a: point.a,
      };
    });

    // Second pass: calculate new dx/dy based on displaced neighbors
    const points = displacedCurve.map((point, i) => {
      let dx: number, dy: number;

      if (displacedCurve.length === 1) {
        // Single point: keep input tangent
        dx = curve[0].dx ?? 0;
        dy = curve[0].dy ?? 0;
      } else if (displacedCurve.length === 2) {
        // Two points: linear gradient
        dx = displacedCurve[1].x - displacedCurve[0].x;
        dy = displacedCurve[1].y - displacedCurve[0].y;
      } else {
        // Three or more: central difference (forward/backward at edges)
        if (i === 0) {
          dx = displacedCurve[1].x - displacedCurve[0].x;
          dy = displacedCurve[1].y - displacedCurve[0].y;
        } else if (i === displacedCurve.length - 1) {
          dx = displacedCurve[i].x - displacedCurve[i - 1].x;
          dy = displacedCurve[i].y - displacedCurve[i - 1].y;
        } else {
          dx = displacedCurve[i + 1].x - displacedCurve[i - 1].x;
          dy = displacedCurve[i + 1].y - displacedCurve[i - 1].y;
        }
      }

      return {
        ...point,
        dx,
        dy,
      } satisfies ResolvedValue<"colorPointValue">;
    });

    return { points };
  },
});

export default curveModulatorNodeImplementation;
