import { describe, expect, it } from 'bun:test';
import rotateNodeImplementation from './rotate';
import type { NodeInputsResolved } from '../../../schema/typeHelpers';

const red   = { r: 1, g: 0, b: 0, a: 1 };
const blue  = { r: 0, g: 0, b: 1, a: 1 };
const white = { r: 1, g: 1, b: 1, a: 1 };

const base: NodeInputsResolved<'rotate'> = {
  inputPoints: [],
  rotationCenters: [],
  rotationAmount: 0,
};

const pt = (x: number, y: number, color = white, dx = 0, dy = 0) => ({
  x, y, dx, dy, ...color,
});

describe('rotateNodeImplementation', () => {
  describe('empty and identity', () => {
    it('returns empty array when no inputs', () => {
      const { points } = rotateNodeImplementation.evaluate(base);
      expect(points).toHaveLength(0);
    });

    it('returns empty when rotationCenters is empty', () => {
      const { points } = rotateNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(1, 0, red)],
        rotationCenters: [],
      });
      expect(points).toHaveLength(0);
    });

    it('returns empty when inputPoints is empty', () => {
      const { points } = rotateNodeImplementation.evaluate({
        ...base,
        inputPoints: [],
        rotationCenters: [pt(0, 0)],
      });
      expect(points).toHaveLength(0);
    });

    it('rotationAmount: 0 — identity', () => {
      const { points } = rotateNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(1, 0, red)],
        rotationCenters: [pt(0, 0)],
        rotationAmount: 0,
      });
      expect(points).toHaveLength(1);
      expect(points[0].x).toBeCloseTo(1);
      expect(points[0].y).toBeCloseTo(0);
    });
  });

  describe('rotation about origin', () => {
    it('rotates (1,0) 90° CCW (amount 0.25) → (0,1)', () => {
      const { points } = rotateNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(1, 0, red)],
        rotationCenters: [pt(0, 0)],
        rotationAmount: 0.25,
      });
      expect(points).toHaveLength(1);
      expect(points[0].x).toBeCloseTo(0);
      expect(points[0].y).toBeCloseTo(1);
    });

    it('rotates (1,0) 180° (amount 0.5) → (-1,0)', () => {
      const { points } = rotateNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(1, 0, red)],
        rotationCenters: [pt(0, 0)],
        rotationAmount: 0.5,
      });
      expect(points).toHaveLength(1);
      expect(points[0].x).toBeCloseTo(-1);
      expect(points[0].y).toBeCloseTo(0);
    });

    it('full rotation (amount 1.0) returns to start', () => {
      const { points } = rotateNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(1, 0, red)],
        rotationCenters: [pt(0, 0)],
        rotationAmount: 1.0,
      });
      expect(points[0].x).toBeCloseTo(1);
      expect(points[0].y).toBeCloseTo(0);
    });
  });

  describe('rotation about off-origin center', () => {
    it('rotates (1,0) 90° CCW about (0.5,0) → (0.5,0.5)', () => {
      const { points } = rotateNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(1, 0, red)],
        rotationCenters: [pt(0.5, 0)],
        rotationAmount: 0.25,
      });
      expect(points[0].x).toBeCloseTo(0.5);
      expect(points[0].y).toBeCloseTo(0.5);
    });
  });

  describe('product cardinality', () => {
    it('2 inputs × 2 centers = 4 outputs', () => {
      const { points } = rotateNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(1, 0, red), pt(0, 1, blue)],
        rotationCenters: [pt(0, 0), pt(0.5, 0)],
        rotationAmount: 0.25,
      });
      expect(points).toHaveLength(4);
      // center (0,0): (1,0)→(0,1), (0,1)→(-1,0)
      expect(points[0].x).toBeCloseTo(0);
      expect(points[0].y).toBeCloseTo(1);
      expect(points[1].x).toBeCloseTo(-1);
      expect(points[1].y).toBeCloseTo(0);
      // center (0.5,0): (1,0)→(0.5,0.5), (0,1)→(-0.5,-0.5)
      expect(points[2].x).toBeCloseTo(0.5);
      expect(points[2].y).toBeCloseTo(0.5);
      expect(points[3].x).toBeCloseTo(-0.5);
      expect(points[3].y).toBeCloseTo(-0.5);
    });
  });

  describe('color', () => {
    it('inherits color from inputPoints, not rotationCenters', () => {
      const { points } = rotateNodeImplementation.evaluate({
        ...base,
        inputPoints: [{ x: 1, y: 0, dx: 0, dy: 0, r: 0.2, g: 0.5, b: 0.8, a: 0.9 }],
        rotationCenters: [pt(0, 0)],
        rotationAmount: 0.25,
      });
      expect(points[0].r).toBeCloseTo(0.2);
      expect(points[0].g).toBeCloseTo(0.5);
      expect(points[0].b).toBeCloseTo(0.8);
      expect(points[0].a).toBeCloseTo(0.9);
    });
  });

  describe('tangent rotation', () => {
    it('rotates tangent (1,0) by 90° → (0,1)', () => {
      const { points } = rotateNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(0, 0, white, 1, 0)],
        rotationCenters: [pt(0, 0)],
        rotationAmount: 0.25,
      });
      expect(points[0].dx).toBeCloseTo(0);
      expect(points[0].dy).toBeCloseTo(1);
    });
  });
});
