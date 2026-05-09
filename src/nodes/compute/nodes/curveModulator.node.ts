import type { ResolvedValue } from '../../../schema/typeHelpers';
import { implementComputeNode } from '../implementComputeNode';
import type { Sampler } from './pointsOnALine';


export const curveModulatorNodeDef = implementComputeNode('curveModulator', {
  defaults: {
    curve: [],
    modulator: null,
  },
  evaluate: (inputs) => {
    const curve = inputs.curve
    const modulator = inputs.modulator as Sampler | null;

    if (!curve || curve.length === 0 || !modulator) {
      // No curve or no modulator: pass through unchanged
      return { points: curve };
    }

    // First pass: displace each point based on its input tangent
    const displacedCurve = curve.map((point, i) => {
      const t = curve.length > 1 ? i / (curve.length - 1) : 0;
      const displacement = modulator.sample(t);

      // Use input dx/dy to calculate perpendicular
      const dx = point.dx ?? 0;
      const dy = point.dy ?? 0;
      const tangentMag = Math.sqrt(dx * dx + dy * dy);
      let perpX: number, perpY: number;

      if (tangentMag > 0) {
        // Normalise tangent and rotate 90°
        perpX = dy / tangentMag;
        perpY = -dx / tangentMag;
      } else {
        // No tangent: no displacement
        perpX = 0;
        perpY = 0;
      }

      return {
        x: point.x + perpX * displacement,
        y: point.y + perpY * displacement,
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
