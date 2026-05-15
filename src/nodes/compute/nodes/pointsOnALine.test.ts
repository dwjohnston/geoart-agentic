import { describe, expect, test } from 'bun:test';
import { pointsOnALineNodeDef } from './pointsOnALine.node';

const A = {
  x: 0, y: 0, r: 0, g: 0, b: 0, a: 1, dx: 0,
  dy: 0,
};
const B = {
  x: 1, y: 1, r: 1, g: 1, b: 1, a: 1, dx: 0,
  dy: 0,
};

describe('pointsOnALineNodeDef', () => {
  test('numberOfPoints=2 returns both endpoints', () => {
    const { points } = pointsOnALineNodeDef.evaluate({ pointA: A, pointB: B, numberOfPoints: 2 });
    expect(points).toHaveLength(2);


    expect(points[0]).toEqual({ ...A, dx: 1, dy: 1 });
    expect(points[1]).toEqual({ ...B, dx: 1, dy: 1 });
  });

  test('numberOfPoints=3 returns endpoints and correct midpoint', () => {
    const { points } = pointsOnALineNodeDef.evaluate({ pointA: A, pointB: B, numberOfPoints: 3 });
    expect(points).toHaveLength(3);
    expect(points[0]).toEqual({ ...A, dx: 1, dy: 1 });
    expect(points[2]).toEqual({ ...B, dx: 1, dy: 1 });
    expect(points[1]).toEqual({ x: 0.5, y: 0.5, r: 0.5, g: 0.5, b: 0.5, a: 1, dx: 1, dy: 1 });
  });

  test('numberOfPoints=1 returns only pointA', () => {
    const { points } = pointsOnALineNodeDef.evaluate({ pointA: A, pointB: B, numberOfPoints: 1 });
    expect(points).toHaveLength(1);
    expect(points[0]).toEqual(A);
  });

  test('numberOfPoints=0 is clamped to 1', () => {
    const { points } = pointsOnALineNodeDef.evaluate({ pointA: A, pointB: B, numberOfPoints: 0 });
    expect(points).toHaveLength(1);
    expect(points[0]).toEqual(A);
  });

  test('negative numberOfPoints is clamped to 1', () => {
    const { points } = pointsOnALineNodeDef.evaluate({ pointA: A, pointB: B, numberOfPoints: -5 });
    expect(points).toHaveLength(1);
    expect(points[0]).toEqual(A);
  });

  test('colour interpolation is correct at midpoint', () => {
    const red = {
      x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0,
      dy: 0,
    };
    const blue = {
      x: 0, y: 0, r: 0, g: 0, b: 1, a: 1, dx: 0,
      dy: 0,
    };
    const { points } = pointsOnALineNodeDef.evaluate({ pointA: red, pointB: blue, numberOfPoints: 3 });
    expect(points[1].r).toBeCloseTo(0.5);
    expect(points[1].g).toBeCloseTo(0);
    expect(points[1].b).toBeCloseTo(0.5);
  });

  test('fractional numberOfPoints is rounded', () => {
    const { points } = pointsOnALineNodeDef.evaluate({ pointA: A, pointB: B, numberOfPoints: 2.7 });
    expect(points).toHaveLength(3);
  });





});
