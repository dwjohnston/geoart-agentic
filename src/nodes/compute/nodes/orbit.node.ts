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
    const colorPoints = rawPoints.map(p => ({

      ...p,
      ...{ r: 1, g: 1, b: 1, a: 1 }
    }));

    return {
      point: rawPoints[0],
      points: colorPoints,
    };
  },
});
