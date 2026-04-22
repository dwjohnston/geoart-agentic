import { describe, expect, test } from 'vitest';
import { pointsOnALine } from './pointsOnALine';
import type { ColorPointData } from './pointsOnALine';

const A: ColorPointData = { x: 0, y: 0, r: 0, g: 0, b: 0, a: 1 };
const B: ColorPointData = { x: 1, y: 1, r: 1, g: 1, b: 1, a: 1 };

describe('pointsOnALine', () => {
  test('numberOfPoints=2 returns both endpoints', () => {
    const result = pointsOnALine(A, B, 2);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(A);
    expect(result[1]).toEqual(B);
  });

  test('numberOfPoints=3 returns endpoints and correct midpoint', () => {
    const result = pointsOnALine(A, B, 3);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(A);
    expect(result[2]).toEqual(B);
    expect(result[1]).toEqual({ x: 0.5, y: 0.5, r: 0.5, g: 0.5, b: 0.5, a: 1 });
  });

  test('numberOfPoints=1 returns only pointA', () => {
    const result = pointsOnALine(A, B, 1);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(A);
  });

  test('numberOfPoints=0 is clamped to 1', () => {
    const result = pointsOnALine(A, B, 0);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(A);
  });

  test('negative numberOfPoints is clamped to 1', () => {
    const result = pointsOnALine(A, B, -5);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(A);
  });

  test('colour interpolation is correct at midpoint', () => {
    const red: ColorPointData  = { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1 };
    const blue: ColorPointData = { x: 0, y: 0, r: 0, g: 0, b: 1, a: 1 };
    const result = pointsOnALine(red, blue, 3);
    expect(result[1].r).toBeCloseTo(0.5);
    expect(result[1].g).toBeCloseTo(0);
    expect(result[1].b).toBeCloseTo(0.5);
  });

  test('fractional numberOfPoints is rounded', () => {
    const result = pointsOnALine(A, B, 2.7);
    expect(result).toHaveLength(3);
  });
});
