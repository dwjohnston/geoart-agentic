import { defineComputeNode } from '../types';
import { evaluateOrbitPoints } from './orbit';

export const orbitNodeDef = defineComputeNode("orbit", {
  isTimeDependant: true,
  defaults: {
    radius: { v: 0.5 },
    speed: { v: 0.5 },
    center: { v: { x: 0, y: 0 } },
    numPoints: { v: 1 },
    phase: { v: 0 },
    time: { v: 0 }
  },
  evaluate: (inputs) => {
    const t = inputs.time.v;
    const radius = inputs.radius.v;
    const speed = inputs.speed.v;
    const center = inputs.center.v;
    const numPoints = Math.max(1, Math.round(inputs.numPoints.v));
    const phase = inputs.phase.v;

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
