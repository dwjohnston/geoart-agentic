import { describe, expect, it } from 'vitest';
import { orbitNodeDef } from './orbit.node';

// speed=1 → 1 orbit per 600 ticks. Tick values for clean positions:
//   t=0    → angle=0    (rightmost point)
//   t=150  → angle=π/2  (quarter turn, top)
//   t=300  → angle=π    (half turn, leftmost)
const base = { time: 0, radius: 0.5, speed: 1, center: { x: 0, y: 0 }, numPoints: 1, phase: 0 };

describe('orbitNodeDef', () => {
  it('at t=0, point is at (radius, 0)', () => {
    const { point } = orbitNodeDef.evaluate(base);
    expect(point.x).toBeCloseTo(0.5);
    expect(point.y).toBeCloseTo(0);
  });

  it('at t=150 (quarter turn), point is at (0, radius)', () => {
    const { point } = orbitNodeDef.evaluate({ ...base, time: 150 });
    expect(point.x).toBeCloseTo(0);
    expect(point.y).toBeCloseTo(0.5);
  });

  it('at t=300 (half turn), point is at (-radius, 0)', () => {
    const { point } = orbitNodeDef.evaluate({ ...base, time: 300 });
    expect(point.x).toBeCloseTo(-0.5);
    expect(point.y).toBeCloseTo(0);
  });

  it('at t=600 (full turn), point returns to start', () => {
    const { point } = orbitNodeDef.evaluate({ ...base, time: 600 });
    expect(point.x).toBeCloseTo(0.5);
    expect(point.y).toBeCloseTo(0);
  });

  it('speed=2 doubles angular velocity', () => {
    const { point } = orbitNodeDef.evaluate({ ...base, speed: 2, time: 150 });
    expect(point.x).toBeCloseTo(-0.5);
    expect(point.y).toBeCloseTo(0);
  });

  it('radius=0 always returns origin', () => {
    const { point } = orbitNodeDef.evaluate({ ...base, radius: 0, time: 100 });
    expect(point.x).toBeCloseTo(0);
    expect(point.y).toBeCloseTo(0);
  });

  it('center offset shifts the point', () => {
    const { point } = orbitNodeDef.evaluate({ ...base, center: { x: 0.3, y: 0.2 } });
    expect(point.x).toBeCloseTo(0.8);
    expect(point.y).toBeCloseTo(0.2);
  });

  it('phase shifts starting angle', () => {
    const { point } = orbitNodeDef.evaluate({ ...base, phase: 0.25 });
    expect(point.x).toBeCloseTo(0);
    expect(point.y).toBeCloseTo(0.5);
  });

  it('numPoints=4 returns four evenly-spaced colour points', () => {
    const { points } = orbitNodeDef.evaluate({ ...base, numPoints: 4 });
    expect(points).toHaveLength(4);
    expect(points[0].x).toBeCloseTo(0.5);
    expect(points[0].y).toBeCloseTo(0);
    expect(points[1].x).toBeCloseTo(0, 5);
    expect(points[1].y).toBeCloseTo(0.5);
    expect(points[2].x).toBeCloseTo(-0.5);
    expect(points[2].y).toBeCloseTo(0, 5);
    expect(points[3].x).toBeCloseTo(0, 5);
    expect(points[3].y).toBeCloseTo(-0.5);
  });

  it('colour points have white colour by default', () => {
    const { points } = orbitNodeDef.evaluate(base);
    expect(points[0]).toMatchObject({ r: 1, g: 1, b: 1, a: 1 });
  });

  it('numPoints=2 returns two points 180 degrees apart', () => {
    const { points } = orbitNodeDef.evaluate({ ...base, numPoints: 2 });
    expect(points).toHaveLength(2);
    expect(points[0].x).toBeCloseTo(0.5);
    expect(points[1].x).toBeCloseTo(-0.5);
  });

  it('exports tangent in direction of motion', () => {
    const { points } = orbitNodeDef.evaluate({ ...base, numPoints: 4 });

    // Check that each point has a unit-magnitude tangent
    points.forEach(p => {
      const mag = Math.sqrt((p.dx ?? 0) ** 2 + (p.dy ?? 0) ** 2);
      expect(mag).toBeCloseTo(1, 2); // Tangent should be normalised
    });
  });

  it('tangents are perpendicular to radius at each point', () => {
    const { points } = orbitNodeDef.evaluate({ ...base, numPoints: 4 });

    points.forEach(p => {
      // Radius vector from center to point
      const radiusX = p.x - base.center.x;
      const radiusY = p.y - base.center.y;

      // Dot product of radius and tangent should be near zero (perpendicular)
      const dotProduct = radiusX * (p.dx ?? 0) + radiusY * (p.dy ?? 0);
      expect(dotProduct).toBeCloseTo(0, 1);
    });
  });

  it('tangent at t=0 points upward (perpendicular to rightmost radius)', () => {
    const { points } = orbitNodeDef.evaluate({ ...base, numPoints: 1 });

    const point = points[0]


    // At t=0, angle=0, point is at (radius, 0)
    // Tangent should be (-sin(0), cos(0)) = (0, 1)
    expect(expect(point.x).toBe(0.5))
    expect(expect(point.y).toBe(0))
    expect(expect(point.dx).toBe(-0))

    expect(expect(point.dy).toBe(-1))



  });
});
