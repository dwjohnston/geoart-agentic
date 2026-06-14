import { describe, expect, test } from 'bun:test';
import reflectNodeImplementation from './reflect';

const RED_POINT = { x: 1, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 1, dy: 0 };
const BLUE_POINT = { x: 0, y: 1, r: 0, g: 0, b: 1, a: 1, dx: 0, dy: 1 };
// Reflection point on x-axis, mirror line = x-axis (direction: 1, 0)
const X_AXIS_MIRROR = { x: 0, y: 0, r: 1, g: 1, b: 1, a: 1, dx: 1, dy: 0 };
// Reflection point on origin, mirror line = y-axis (direction: 0, 1)
const Y_AXIS_MIRROR = { x: 0, y: 0, r: 1, g: 1, b: 1, a: 1, dx: 0, dy: 1 };
// Reflection point on origin, mirror line = y=x diagonal (direction: 1, 1)
const DIAGONAL_MIRROR = { x: 0, y: 0, r: 1, g: 1, b: 1, a: 1, dx: 1, dy: 1 };

describe('reflectNodeImplementation', () => {
  test('returns empty array for empty inputPoints', () => {
    const { points } = reflectNodeImplementation.evaluate({
      inputPoints: [],
      reflectionPoints: [X_AXIS_MIRROR],
    });
    expect(points).toHaveLength(0);
  });

  test('returns empty array for empty reflectionPoints', () => {
    const { points } = reflectNodeImplementation.evaluate({
      inputPoints: [RED_POINT],
      reflectionPoints: [],
    });
    expect(points).toHaveLength(0);
  });

  test('reflects about x-axis: y flips sign', () => {
    const { points } = reflectNodeImplementation.evaluate({
      inputPoints: [{ ...RED_POINT, x: 0, y: 1 }],
      reflectionPoints: [X_AXIS_MIRROR],
    });
    expect(points).toHaveLength(1);
    expect(points[0].x).toBeCloseTo(0);
    expect(points[0].y).toBeCloseTo(-1);
  });

  test('reflects about y-axis: x flips sign', () => {
    const { points } = reflectNodeImplementation.evaluate({
      inputPoints: [{ ...RED_POINT, x: 1, y: 0 }],
      reflectionPoints: [Y_AXIS_MIRROR],
    });
    expect(points).toHaveLength(1);
    expect(points[0].x).toBeCloseTo(-1);
    expect(points[0].y).toBeCloseTo(0);
  });

  test('reflects about y=x diagonal: x and y swap', () => {
    const { points } = reflectNodeImplementation.evaluate({
      inputPoints: [{ ...RED_POINT, x: 3, y: 1 }],
      reflectionPoints: [DIAGONAL_MIRROR],
    });
    expect(points).toHaveLength(1);
    expect(points[0].x).toBeCloseTo(1);
    expect(points[0].y).toBeCloseTo(3);
  });

  test('product cardinality: 2 input × 2 reflection = 4 output points', () => {
    const { points } = reflectNodeImplementation.evaluate({
      inputPoints: [RED_POINT, BLUE_POINT],
      reflectionPoints: [X_AXIS_MIRROR, Y_AXIS_MIRROR],
    });
    expect(points).toHaveLength(4);
  });

  test('dx=dy=0 reflection point is a no-op', () => {
    const noop = { x: 0.5, y: 0.5, r: 1, g: 1, b: 1, a: 1, dx: 0, dy: 0 };
    const input = { x: 0.3, y: 0.7, r: 1, g: 0, b: 0, a: 1, dx: 0, dy: 0 };
    const { points } = reflectNodeImplementation.evaluate({
      inputPoints: [input],
      reflectionPoints: [noop],
    });
    expect(points).toHaveLength(1);
    expect(points[0].x).toBeCloseTo(input.x);
    expect(points[0].y).toBeCloseTo(input.y);
  });

  test('reflection preserves input point colour', () => {
    const colorPoint = { x: 0, y: 1, r: 0.2, g: 0.5, b: 0.8, a: 0.9, dx: 0, dy: 0 };
    const { points } = reflectNodeImplementation.evaluate({
      inputPoints: [colorPoint],
      reflectionPoints: [X_AXIS_MIRROR],
    });
    expect(points[0].r).toBeCloseTo(0.2);
    expect(points[0].g).toBeCloseTo(0.5);
    expect(points[0].b).toBeCloseTo(0.8);
    expect(points[0].a).toBeCloseTo(0.9);
  });

  test('reflection through offset point works correctly', () => {
    // Mirror line: horizontal (dx=1, dy=0) through (0, 1)
    const mirror = { x: 0, y: 1, r: 1, g: 1, b: 1, a: 1, dx: 1, dy: 0 };
    // Reflecting (0, 2) about y=1 should give (0, 0)
    const { points } = reflectNodeImplementation.evaluate({
      inputPoints: [{ x: 0, y: 2, r: 1, g: 0, b: 0, a: 1, dx: 0, dy: 0 }],
      reflectionPoints: [mirror],
    });
    expect(points[0].x).toBeCloseTo(0);
    expect(points[0].y).toBeCloseTo(0);
  });

  test('tangent vector is reflected along with position', () => {
    // Reflect point with upward tangent (0,1) about x-axis: tangent becomes downward (0,-1)
    const input = { x: 1, y: 1, r: 1, g: 0, b: 0, a: 1, dx: 0, dy: 1 };
    const { points } = reflectNodeImplementation.evaluate({
      inputPoints: [input],
      reflectionPoints: [X_AXIS_MIRROR],
    });
    expect(points[0].dx).toBeCloseTo(0);
    expect(points[0].dy).toBeCloseTo(-1);
  });

  test('null colour channels are preserved as null', () => {
    const nullColorPoint = { x: 0, y: 1, r: null, g: null, b: null, a: 1, dx: 0, dy: 0 };
    const { points } = reflectNodeImplementation.evaluate({
      inputPoints: [nullColorPoint],
      reflectionPoints: [X_AXIS_MIRROR],
    });
    expect(points[0].r).toBeNull();
    expect(points[0].g).toBeNull();
    expect(points[0].b).toBeNull();
    expect(points[0].a).toBeCloseTo(1);
  });
});
