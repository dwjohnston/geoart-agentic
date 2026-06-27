import { describe, it, expect } from 'vitest';
import pointsOnALineV2NodeDef from './pointsOnALineV2';

const makePoint = (x: number, y: number, r = 1, g = 1, b = 1, a = 1) => ({
  x, y, r, g, b, a, dx: 0, dy: 0,
});

describe('pointsOnALineV2', () => {
  it('single control point returns numPoints copies of it', () => {
    const pt = makePoint(0.5, 0.3, 0.2, 0.4, 0.6, 0.8);
    const { points } = pointsOnALineV2NodeDef.evaluate({
      colorPoints: [pt],
      numPoints: 4,
      curveMode: 'straight',
    });
    expect(points).toHaveLength(4);
    for (const p of points) {
      expect(p.x).toBe(pt.x);
      expect(p.y).toBe(pt.y);
      expect(p.r).toBe(pt.r);
      expect(p.dx).toBe(0);
      expect(p.dy).toBe(0);
    }
  });

  it('two straight-line control points with numPoints=2 returns both endpoints with correct dx/dy', () => {
    const A = makePoint(0, 0, 1, 0, 0, 1);
    const B = makePoint(1, 0, 0, 0, 1, 1);
    const { points } = pointsOnALineV2NodeDef.evaluate({
      colorPoints: [A, B],
      numPoints: 2,
      curveMode: 'straight',
    });
    expect(points).toHaveLength(2);
    expect(points[0].x).toBeCloseTo(0);
    expect(points[0].y).toBeCloseTo(0);
    expect(points[1].x).toBeCloseTo(1);
    expect(points[1].y).toBeCloseTo(0);
    // direction vector should be (1, 0)
    expect(points[0].dx).toBeCloseTo(1);
    expect(points[0].dy).toBeCloseTo(0);
    expect(points[1].dx).toBeCloseTo(1);
    expect(points[1].dy).toBeCloseTo(0);
  });

  it('two straight-line control points with numPoints=3 returns endpoints and correct midpoint', () => {
    const A = makePoint(0, 0, 1, 0, 0, 1);
    const B = makePoint(2, 0, 0, 0, 1, 1);
    const { points } = pointsOnALineV2NodeDef.evaluate({
      colorPoints: [A, B],
      numPoints: 3,
      curveMode: 'straight',
    });
    expect(points).toHaveLength(3);
    expect(points[0].x).toBeCloseTo(0);
    expect(points[1].x).toBeCloseTo(1);
    expect(points[2].x).toBeCloseTo(2);
    expect(points[1].y).toBeCloseTo(0);
    // midpoint colour should be halfway
    expect(points[1].r).toBeCloseTo(0.5);
    expect(points[1].b).toBeCloseTo(0.5);
  });

  it('numPoints=1 returns only the first control point', () => {
    const A = makePoint(0, 0);
    const B = makePoint(1, 1);
    const { points } = pointsOnALineV2NodeDef.evaluate({
      colorPoints: [A, B],
      numPoints: 1,
      curveMode: 'straight',
    });
    expect(points).toHaveLength(1);
    expect(points[0].x).toBeCloseTo(0);
    expect(points[0].y).toBeCloseTo(0);
  });

  it('numPoints=0 is clamped to 1', () => {
    const A = makePoint(0, 0);
    const B = makePoint(1, 1);
    const { points } = pointsOnALineV2NodeDef.evaluate({
      colorPoints: [A, B],
      numPoints: 0,
      curveMode: 'straight',
    });
    expect(points).toHaveLength(1);
  });

  it('three control points in straight mode returns correct number of output points', () => {
    const A = makePoint(0, 0);
    const B = makePoint(1, 0);
    const C = makePoint(2, 0);
    const { points } = pointsOnALineV2NodeDef.evaluate({
      colorPoints: [A, B, C],
      numPoints: 5,
      curveMode: 'straight',
    });
    expect(points).toHaveLength(5);
  });

  it('catmull-rom with two points and numPoints=2 returns both control points', () => {
    const A = makePoint(0, 0, 1, 0, 0, 1);
    const B = makePoint(1, 0, 0, 0, 1, 1);
    const { points } = pointsOnALineV2NodeDef.evaluate({
      colorPoints: [A, B],
      numPoints: 2,
      curveMode: 'catmull-rom',
    });
    expect(points).toHaveLength(2);
    expect(points[0].x).toBeCloseTo(0, 3);
    expect(points[0].y).toBeCloseTo(0, 3);
    expect(points[1].x).toBeCloseTo(1, 3);
    expect(points[1].y).toBeCloseTo(0, 3);
  });

  it('empty colorPoints returns empty array', () => {
    const { points } = pointsOnALineV2NodeDef.evaluate({
      colorPoints: [],
      numPoints: 5,
      curveMode: 'straight',
    });
    expect(points).toHaveLength(0);
  });
});
