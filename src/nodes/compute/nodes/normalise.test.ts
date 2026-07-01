import { describe, expect, it } from 'bun:test';
import normaliseNodeImplementation from './normalise';
import type { NodeInputsResolved } from '../../../schema/typeHelpers';

const white = { r: 1, g: 1, b: 1, a: 1 };

const base: NodeInputsResolved<'normalise'> = {
  inputPoints: [],
  normalisationCenters: [],
  normalisationOrigin: [],
  normalisationSize: 1,
  strength: 1,
};

const pt = (x: number, y: number, color = white, dx = 0, dy = 0) => ({
  x, y, dx, dy, ...color,
});

// A triangle pointing "up" (apex at the top), centred on the origin.
const triangle = [pt(0, 0.5), pt(-0.5, -0.5), pt(0.5, -0.5)];

describe('normaliseNodeImplementation', () => {
  describe('empty and identity', () => {
    it('returns empty array when no inputs', () => {
      const { points } = normaliseNodeImplementation.evaluate(base);
      expect(points).toHaveLength(0);
    });

    it('returns empty when normalisationCenters is empty', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: triangle,
        normalisationCenters: [],
        normalisationOrigin: [pt(0, 1)],
      });
      expect(points).toHaveLength(0);
    });

    it('returns empty when normalisationOrigin is empty', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: triangle,
        normalisationCenters: [pt(0, 0)],
        normalisationOrigin: [],
      });
      expect(points).toHaveLength(0);
    });

    it('skips a normalisation origin coincident with its center', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: triangle,
        normalisationCenters: [pt(0, 0)],
        normalisationOrigin: [pt(0, 0)],
      });
      expect(points).toHaveLength(0);
    });

    it('strength 0 leaves positions unchanged (identity)', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: triangle,
        normalisationCenters: [pt(1, 1)],
        normalisationOrigin: [pt(1, 2)],
        normalisationSize: 2,
        strength: 0,
      });
      expect(points).toHaveLength(3);
      points.forEach((p, i) => {
        expect(p.x).toBeCloseTo(triangle[i].x);
        expect(p.y).toBeCloseTo(triangle[i].y);
      });
    });
  });

  describe('worked example — orientation follows normalisation origin', () => {
    it('origin above center → triangle stays pointing up', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: triangle,
        normalisationCenters: [pt(0, 0)],
        normalisationOrigin: [pt(0, 0.25)],
      });
      expect(points).toHaveLength(3);
      expect(points[0].x).toBeCloseTo(0);
      expect(points[0].y).toBeCloseTo(0.5);
    });

    it('origin left of center → triangle points left', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: triangle,
        normalisationCenters: [pt(0, 0)],
        normalisationOrigin: [pt(-0.25, 0)],
      });
      expect(points).toHaveLength(3);
      expect(points[0].x).toBeCloseTo(-0.5);
      expect(points[0].y).toBeCloseTo(0);
    });

    it('origin right of center → triangle points right', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: triangle,
        normalisationCenters: [pt(0, 0)],
        normalisationOrigin: [pt(0.25, 0)],
      });
      expect(points).toHaveLength(3);
      expect(points[0].x).toBeCloseTo(0.5);
      expect(points[0].y).toBeCloseTo(0);
    });
  });

  describe('normalisationSize scaling', () => {
    it('scales the fitted bounding box to the requested size', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: triangle,
        normalisationCenters: [pt(0, 0)],
        normalisationOrigin: [pt(0, 1)],
        normalisationSize: 2,
      });
      expect(points[0].y).toBeCloseTo(1);
      expect(points[1].y).toBeCloseTo(-1);
    });
  });

  describe('centering', () => {
    it('fits around an off-origin normalisation center', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: triangle,
        normalisationCenters: [pt(2, 3)],
        normalisationOrigin: [pt(2, 4)],
      });
      expect(points[0].x).toBeCloseTo(2);
      expect(points[0].y).toBeCloseTo(3.5);
    });
  });

  describe('strength lerp', () => {
    it('strength 0.5 halfway between original and normalised', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: triangle,
        normalisationCenters: [pt(0, 0)],
        normalisationOrigin: [pt(-0.25, 0)],
        strength: 0.5,
      });
      // apex: strength-1 target is (-0.5, 0); original is (0, 0.5)
      expect(points[0].x).toBeCloseTo(-0.25);
      expect(points[0].y).toBeCloseTo(0.25);
    });
  });

  describe('product cardinality', () => {
    it('N input points x M centers x O origins = N*M*O outputs', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: triangle,
        normalisationCenters: [pt(0, 0), pt(1, 1)],
        normalisationOrigin: [pt(0, 1), pt(1, 0)],
      });
      expect(points).toHaveLength(3 * 2 * 2);
    });
  });

  describe('color', () => {
    it('inherits color from input points, unaffected by center/origin color', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        ...base,
        inputPoints: [{ x: 0, y: 0.5, dx: 0, dy: 0, r: 0.2, g: 0.5, b: 0.8, a: 0.9 }],
        normalisationCenters: [pt(0, 0, { r: 1, g: 0, b: 0, a: 1 })],
        normalisationOrigin: [pt(0, 1, { r: 0, g: 1, b: 0, a: 1 })],
      });
      expect(points[0].r).toBeCloseTo(0.2);
      expect(points[0].g).toBeCloseTo(0.5);
      expect(points[0].b).toBeCloseTo(0.8);
      expect(points[0].a).toBeCloseTo(0.9);
    });
  });
});
