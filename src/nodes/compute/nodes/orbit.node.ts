import type { ResolvedValue } from '../../../schema/typeHelpers';
import { implementComputeNode } from '../implementComputeNode';

function evaluateOrbitPoints(
  radius: number,
  speed: number,
  t: number,
  numPoints: number,
  phase: number,
  cx = 0,
  cy = 0,
  eccentricity = 0,
  tilt = 0,
): Array<{ x: number; y: number }> {
  const phaseRadians = phase * 2 * Math.PI;
  const baseAngle = speed * (t / 600) * 2 * Math.PI + phaseRadians;
  const tiltRadians = tilt * 2 * Math.PI;
  const spacing = (2 * Math.PI) / Math.max(1, numPoints);
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = baseAngle + i * spacing;
    const px = radius * Math.cos(angle);
    const py = radius * (1 - eccentricity) * Math.sin(angle);
    points.push({
      x: cx + px * Math.cos(tiltRadians) - py * Math.sin(tiltRadians),
      y: cy + px * Math.sin(tiltRadians) + py * Math.cos(tiltRadians),
    });
  }
  return points;
}

const DEFAULT_CENTER_COLOR = { r: 1, g: 1, b: 1, a: 1 };
const DEFAULT_CENTER_POINT = { x: 0.5, y: 0.5 };

const orbitNodeDef = implementComputeNode("orbit", {
  isTimeDependant: true,
  defaults: {
    radius: 0.5,
    speed: 0.5,
    center: { x: 0, y: 0 },
    centerPoints: [],
    numPoints: 1,
    phase: 0,
    time: 0,
    eccentricity: 0,
    tilt: 0,
  },
  evaluate: (inputs) => {
    const t = inputs.time;
    const radius = inputs.radius;
    const speed = inputs.speed;
    const numPoints = Math.max(1, Math.round(inputs.numPoints));
    const phase = inputs.phase;
    const eccentricity = inputs.eccentricity;
    const tilt = inputs.tilt;

    // Resolve the array of centre points according to the precedence rules:
    // 1. centerPoints if provided and non-empty
    // 2. center (deprecated) wrapped with default white colour
    // 3. default centre (0.5, 0.5) wrapped with default white colour
    const resolvedCenterPoints = inputs.centerPoints ?? [];
    const centreArray: ResolvedValue<"colorPointArrayValue"> =
      resolvedCenterPoints.length > 0
        ? resolvedCenterPoints
        : inputs.center
          ? [{ ...DEFAULT_CENTER_POINT, ...DEFAULT_CENTER_COLOR, x: inputs.center.x, y: inputs.center.y, dx: 0, dy: 0 }]
          : [{ ...DEFAULT_CENTER_POINT, ...DEFAULT_CENTER_COLOR, dx: 0, dy: 0 }];

    // Precompute shared angle values once
    const phaseRadians = phase * 2 * Math.PI;
    const baseAngle = speed * (t / 600) * 2 * Math.PI + phaseRadians;
    const spacing = (2 * Math.PI) / Math.max(1, numPoints);

    const allPoints: Array<{ x: number; y: number; r: number | null; g: number | null; b: number | null; a: number | null; dx: number; dy: number }> = [];

    for (const centre of centreArray) {
      const rawPoints = evaluateOrbitPoints(radius, speed, t, numPoints, phase, centre.x, centre.y, eccentricity, tilt);

      for (let i = 0; i < rawPoints.length; i++) {
        const p = rawPoints[i];
        const pointAngle = baseAngle + i * spacing;

        // Tangent is perpendicular to the radius vector (90° rotation)
        const dx = -Math.sin(pointAngle);
        const dy = Math.cos(pointAngle);

        allPoints.push({
          x: p.x,
          y: p.y,
          r: centre.r,
          g: centre.g,
          b: centre.b,
          a: centre.a,
          dx,
          dy,
        });
      }
    }

    const fallbackPoint = allPoints[0] ?? {
      x: DEFAULT_CENTER_POINT.x,
      y: DEFAULT_CENTER_POINT.y,
      ...DEFAULT_CENTER_COLOR,
      dx: 0,
      dy: 0,
    };

    return {
      point: fallbackPoint,
      points: allPoints,
    };
  },
});

export default orbitNodeDef;
