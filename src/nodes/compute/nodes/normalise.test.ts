import { describe, expect, it } from 'bun:test';
import normaliseNodeImplementation from './normalise';
import type { NodeInputsResolved } from '../../../schema/typeHelpers';

const white = { r: 1, g: 1, b: 1, a: 1 };

const base: NodeInputsResolved<'normalise'> = {
  inputPoints: [],
  normalisationCenters: [],
  normalisationOrigin: [],
  normalisationSize: 1,
  strength: 0,
};

const pt = (x: number, y: number, color = white, dx = 0, dy = 0) => ({
  x, y, dx, dy, ...color,
});

describe('normaliseNodeImplementation', () => {
  describe('empty and no-op', () => {
    it('returns empty array when no inputs', () => {
      const { points } = normaliseNodeImplementation.evaluate(base);
      expect(points).toHaveLength(0);
    });

    it('returns empty when inputPoints is empty', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: [],
        normalisationCenters: [pt(0, 0)],
        normalisationOrigin: [pt(0, 1)],
        strength: 1,
      });
      expect(points).toHaveLength(0);
    });

    it('returns empty when normalisationCenters is empty', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(1, 1)],
        normalisationCenters: [],
        normalisationOrigin: [pt(0, 1)],
        strength: 1,
      });
      expect(points).toHaveLength(0);
    });

    it('skips a center/origin pair when origin coincides with center (no "up" direction)', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(1, 1)],
        normalisationCenters: [pt(0, 0)],
        normalisationOrigin: [pt(0, 0)],
        strength: 1,
      });
      expect(points).toHaveLength(0);
    });
  });

  describe('strength: 0 — identity', () => {
    it('returns original positions unchanged', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(-1, -1), pt(1, -1), pt(1, 1), pt(-1, 1)],
        normalisationCenters: [pt(5, 5)],
        normalisationOrigin: [pt(5, 6)],
        normalisationSize: 4,
        strength: 0,
      });
      expect(points).toHaveLength(4);
      expect(points[0].x).toBeCloseTo(-1);
      expect(points[0].y).toBeCloseTo(-1);
      expect(points[3].x).toBeCloseTo(-1);
      expect(points[3].y).toBeCloseTo(1);
    });
  });

  describe('fit into bounding box (no rotation)', () => {
    it('scales and translates a 2×2 square to a 4×4 box centred on (5,5)', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(-1, -1), pt(1, -1), pt(1, 1), pt(-1, 1)],
        normalisationCenters: [pt(5, 5)],
        normalisationOrigin: [pt(5, 6)],
        normalisationSize: 4,
        strength: 1,
      });
      expect(points).toHaveLength(4);
      expect(points[0].x).toBeCloseTo(3);
      expect(points[0].y).toBeCloseTo(3);
      expect(points[1].x).toBeCloseTo(7);
      expect(points[1].y).toBeCloseTo(3);
      expect(points[2].x).toBeCloseTo(7);
      expect(points[2].y).toBeCloseTo(7);
      expect(points[3].x).toBeCloseTo(3);
      expect(points[3].y).toBeCloseTo(7);
    });
  });

  describe('orientation follows normalisationOrigin ("up")', () => {
    // An upward-pointing triangle: apex, base-left, base-right.
    const triangle = [pt(0, 1), pt(-1, -1), pt(1, -1)];

    it('origin directly above center — triangle stays pointing up', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: triangle,
        normalisationCenters: [pt(0, 0)],
        normalisationOrigin: [pt(0, 1)],
        normalisationSize: 2,
        strength: 1,
      });
      expect(points[0].x).toBeCloseTo(0);
      expect(points[0].y).toBeCloseTo(1);
      expect(points[1].x).toBeCloseTo(-1);
      expect(points[1].y).toBeCloseTo(-1);
      expect(points[2].x).toBeCloseTo(1);
      expect(points[2].y).toBeCloseTo(-1);
    });

    it('origin to the right of center — triangle points right', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: triangle,
        normalisationCenters: [pt(0, 0)],
        normalisationOrigin: [pt(1, 0)],
        normalisationSize: 2,
        strength: 1,
      });
      expect(points[0].x).toBeCloseTo(1);
      expect(points[0].y).toBeCloseTo(0);
      expect(points[1].x).toBeCloseTo(-1);
      expect(points[1].y).toBeCloseTo(1);
      expect(points[2].x).toBeCloseTo(-1);
      expect(points[2].y).toBeCloseTo(-1);
    });

    it('origin to the left of center — triangle points left', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: triangle,
        normalisationCenters: [pt(0, 0)],
        normalisationOrigin: [pt(-1, 0)],
        normalisationSize: 2,
        strength: 1,
      });
      expect(points[0].x).toBeCloseTo(-1);
      expect(points[0].y).toBeCloseTo(0);
      expect(points[1].x).toBeCloseTo(1);
      expect(points[1].y).toBeCloseTo(-1);
      expect(points[2].x).toBeCloseTo(1);
      expect(points[2].y).toBeCloseTo(1);
    });
  });

  describe('strength: 0.5 — lerp between original and normalised', () => {
    it('halfway between (-1,-1) and its normalised position (3,3)', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(-1, -1), pt(1, -1), pt(1, 1), pt(-1, 1)],
        normalisationCenters: [pt(5, 5)],
        normalisationOrigin: [pt(5, 6)],
        normalisationSize: 4,
        strength: 0.5,
      });
      expect(points[0].x).toBeCloseTo(1);
      expect(points[0].y).toBeCloseTo(1);
    });
  });

  describe('degenerate single-point bounding box', () => {
    it('snaps a single input point directly onto the normalisation center', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(7, 7)],
        normalisationCenters: [pt(2, 3)],
        normalisationOrigin: [pt(2, 4)],
        normalisationSize: 10,
        strength: 1,
      });
      expect(points).toHaveLength(1);
      expect(points[0].x).toBeCloseTo(2);
      expect(points[0].y).toBeCloseTo(3);
    });
  });

  describe('product cardinality', () => {
    it('1 input × 2 centers × 2 origins = 4 outputs', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: [pt(1, 1)],
        normalisationCenters: [pt(0, 0), pt(10, 10)],
        normalisationOrigin: [pt(0, 1), pt(1, 0)],
        normalisationSize: 2,
        strength: 1,
      });
      expect(points).toHaveLength(4);
    });
  });

  describe('color', () => {
    it('inherits color from the input point, not the center or origin', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: [{ x: -1, y: -1, dx: 0, dy: 0, r: 0.2, g: 0.5, b: 0.8, a: 0.9 }],
        normalisationCenters: [pt(5, 5)],
        normalisationOrigin: [pt(5, 6)],
        normalisationSize: 4,
        strength: 1,
      });
      expect(points[0].r).toBeCloseTo(0.2);
      expect(points[0].g).toBeCloseTo(0.5);
      expect(points[0].b).toBeCloseTo(0.8);
      expect(points[0].a).toBeCloseTo(0.9);
    });
  });
});
