import type { ResolvedValue } from '../../../schema/typeHelpers';
import { implementComputeNode } from '../implementComputeNode';
import { applyColorShiftOperation, computeDriver } from '../colorShiftOperations';

type ColorPoint = ResolvedValue<'colorPointValue'>;

function rotatePoint(p: ColorPoint, center: ColorPoint, theta: number): ColorPoint {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

  const relX = p.x - center.x;
  const relY = p.y - center.y;

  return {
    x: relX * cos - relY * sin + center.x,
    y: relX * sin + relY * cos + center.y,
    dx: p.dx * cos - p.dy * sin,
    dy: p.dx * sin + p.dy * cos,
    r: p.r,
    g: p.g,
    b: p.b,
    a: p.a,
  };
}

const rotateNodeImplementation = implementComputeNode('rotate', {
  isTimeDependant: false,
  defaults: {
    inputPoints: [],
    rotationCenters: [],
    rotationAmount: 0,
    colorShiftOperation: 'none' as const,
  },
  evaluate: (inputs) => {
    const theta = inputs.rotationAmount * 2 * Math.PI;
    const points: ColorPoint[] = [];

    for (const center of inputs.rotationCenters) {
      const axisX = center.dx ?? 1;
      const axisY = center.dy ?? 0;
      for (const p of inputs.inputPoints) {
        const rotated = rotatePoint(p, center, theta);
        if (inputs.colorShiftOperation !== 'none') {
          const driver = computeDriver(p.x, p.y, center.x, center.y, axisX, axisY);
          const shifted = applyColorShiftOperation(
            { r: rotated.r, g: rotated.g, b: rotated.b, a: rotated.a },
            { r: center.r, g: center.g, b: center.b, a: center.a },
            driver,
            inputs.colorShiftOperation,
          );
          points.push({ ...rotated, ...shifted });
        } else {
          points.push(rotated);
        }
      }
    }

    return { points };
  },
});

export default rotateNodeImplementation;
