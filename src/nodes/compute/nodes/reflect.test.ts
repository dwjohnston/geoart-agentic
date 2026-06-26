import { describe, expect, it } from 'bun:test';
import reflectNodeImplementation from './reflect';
import type { NodeInputsResolved } from '../../../schema/typeHelpers';

const white = { r: 1, g: 1, b: 1, a: 1 };

const base: NodeInputsResolved<'reflect'> = {
  inputPoints: [],
  reflectionPoints: [],
};

const pt = (x: number, y: number, dx = 0, dy = 0) => ({
  x, y, dx, dy, ...white,
});

// Reflection point: position + tangent direction defining the mirror line
const rp = (x: number, y: number, dx: number, dy: number) => ({
  x, y, dx, dy, ...white,
});

describe('reflectNodeImplementation', () => {
  describe('no-op and empty', () => {
    it('returns empty array when no inputs', () => {
      const { points } = reflectNodeImplementation.evaluate(base);
      expect(points).toHaveLength(0);
    });

    it('skips reflection points with dx=0, dy=0', () => {
      const { points } = reflectNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(1, 0)],
        reflectionPoints: [rp(0, 0, 0, 0)],
      });
      expect(points).toHaveLength(0);
    });

    it('returns empty when inputPoints is empty', () => {
      const { points } = reflectNodeImplementation.evaluate({
        ...base,
        inputPoints: [],
        reflectionPoints: [rp(0, 0, 0, 1)],
      });
      expect(points).toHaveLength(0);
    });
  });

  describe('geometry — reflection about line through origin', () => {
    it('reflects (1, 0) about vertical line (direction 0,1) → (-1, 0)', () => {
      const { points } = reflectNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(1, 0)],
        reflectionPoints: [rp(0, 0, 0, 1)],
      });
      expect(points).toHaveLength(1);
      expect(points[0].x).toBeCloseTo(-1);
      expect(points[0].y).toBeCloseTo(0);
    });

    it('reflects (1, 1) about horizontal line (direction 1,0) → (1, -1)', () => {
      const { points } = reflectNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(1, 1)],
        reflectionPoints: [rp(0, 0, 1, 0)],
      });
      expect(points).toHaveLength(1);
      expect(points[0].x).toBeCloseTo(1);
      expect(points[0].y).toBeCloseTo(-1);
    });

    it('point on the mirror line is unchanged', () => {
      const { points } = reflectNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(1, 0)],
        reflectionPoints: [rp(0, 0, 1, 0)],
      });
      expect(points[0].x).toBeCloseTo(1);
      expect(points[0].y).toBeCloseTo(0);
    });
  });

  describe('geometry — off-centre reflection point', () => {
    it('reflects (1, 0) about vertical line at x=0.5 → (0, 0)', () => {
      const { points } = reflectNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(1, 0)],
        reflectionPoints: [rp(0.5, 0, 0, 1)],
      });
      expect(points).toHaveLength(1);
      expect(points[0].x).toBeCloseTo(0);
      expect(points[0].y).toBeCloseTo(0);
    });

    it('reflects (0, 1) about horizontal line at y=0.5 → (0, 0)', () => {
      const { points } = reflectNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(0, 1)],
        reflectionPoints: [rp(0, 0.5, 1, 0)],
      });
      expect(points).toHaveLength(1);
      expect(points[0].x).toBeCloseTo(0);
      expect(points[0].y).toBeCloseTo(0);
    });
  });

  describe('product cardinality', () => {
    it('2 inputs × 2 reflection points = 4 outputs', () => {
      const { points } = reflectNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(1, 0), pt(0, 1)],
        reflectionPoints: [rp(0, 0, 0, 1), rp(0, 0, 1, 0)],
      });
      expect(points).toHaveLength(4);
    });

    it('1 no-op reflection point + 1 valid = only valid contributes', () => {
      const { points } = reflectNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(1, 0)],
        reflectionPoints: [rp(0, 0, 0, 0), rp(0, 0, 0, 1)],
      });
      expect(points).toHaveLength(1);
    });
  });

  describe('color', () => {
    it('inherits color from input point', () => {
      const { points } = reflectNodeImplementation.evaluate({
        ...base,
        inputPoints: [{ x: 1, y: 0, dx: 0, dy: 0, r: 0.2, g: 0.5, b: 0.8, a: 0.9 }],
        reflectionPoints: [rp(0, 0, 0, 1)],
      });
      expect(points[0].r).toBeCloseTo(0.2);
      expect(points[0].g).toBeCloseTo(0.5);
      expect(points[0].b).toBeCloseTo(0.8);
      expect(points[0].a).toBeCloseTo(0.9);
    });
  });

  describe('tangent reflection', () => {
    it('reflects tangent (1, 0) about vertical line → (-1, 0)', () => {
      const { points } = reflectNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(1, 0, 1, 0)],
        reflectionPoints: [rp(0, 0, 0, 1)],
      });
      expect(points[0].dx).toBeCloseTo(-1);
      expect(points[0].dy).toBeCloseTo(0);
    });

    it('reflects tangent (0, 1) about horizontal line → (0, -1)', () => {
      const { points } = reflectNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(0, 0, 0, 1)],
        reflectionPoints: [rp(0, 0, 1, 0)],
      });
      expect(points[0].dx).toBeCloseTo(0);
      expect(points[0].dy).toBeCloseTo(-1);
    });
  });

  describe('diagonal reflection', () => {
    it('reflects (1, 0) about 45° line (direction 1,1) → (0, 1)', () => {
      const { points } = reflectNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(1, 0)],
        reflectionPoints: [rp(0, 0, 1, 1)],
      });
      expect(points).toHaveLength(1);
      expect(points[0].x).toBeCloseTo(0);
      expect(points[0].y).toBeCloseTo(1);
    });
  });
});
