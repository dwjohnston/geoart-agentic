import { implementComputeNode } from '../implementComputeNode';
import { evaluateOrbitPoints } from './orbit';

export const orbitNodeDef = implementComputeNode("orbit", {
  isTimeDependant: true,
  defaults: {
    radius: 0.5,
    speed: 0.5,
    center: { x: 0, y: 0 },
    numPoints: 1,
    phase: 0,
    time: 0
  },
  evaluate: (inputs) => {
    const t = inputs.time;
    const radius = inputs.radius;
    const speed = inputs.speed;
    const center = inputs.center;
    const numPoints = Math.max(1, Math.round(inputs.numPoints));
    const phase = inputs.phase;

    const rawPoints = evaluateOrbitPoints(radius, speed, t, numPoints, phase, center.x, center.y);

    // For each point on the orbit, calculate the tangent (velocity direction)
    const colorPoints = rawPoints.map((p, i) => {
      // Calculate the angle at this point (match evaluateOrbitPoints formula)
      const phaseRadians = phase * 2 * Math.PI;
      const baseAngle = speed * (t / 600) * 2 * Math.PI + phaseRadians;
      const spacing = (2 * Math.PI) / Math.max(1, numPoints);
      const pointPhase = baseAngle + i * spacing;

      // Tangent is perpendicular to the radius vector (90° rotation)
      // Radius vector: (cos(angle), sin(angle))
      // Tangent: (-sin(angle), cos(angle))
      const dx = -Math.sin(pointPhase);
      const dy = Math.cos(pointPhase);

      return {
        ...p,
        r: 1,
        g: 1,
        b: 1,
        a: 1,
        dx,
        dy,
      };
    });

    return {
      point: colorPoints[0],
      points: colorPoints,
    };
  },
});
