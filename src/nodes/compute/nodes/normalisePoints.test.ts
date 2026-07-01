import { describe, expect, it } from 'bun:test';
import normalisePointsNodeDef from './normalisePoints';
import type { NodeInputsResolved } from '../../../schema/typeHelpers';

const white = { r: 1, g: 1, b: 1, a: 1 };
const red   = { r: 1, g: 0, b: 0, a: 1 };

const pt = (x: number, y: number, color = white) => ({ x, y, dx: 0, dy: 0, ...color });

const base: NodeInputsResolved<'normalisePoints'> = {
  inputPoints: [],
  normalisationCenters: [pt(0, 0)],
  normalisationOrigin: [pt(0, 1)],
  normalisationSize: 1,
  strength: 1,
};

describe('normalisePointsNodeDef', () => {
  describe('empty / degenerate', () => {
    it('returns empty when inputPoints is empty', () => {
      const { points } = normalisePointsNodeDef.evaluate(base);
      expect(points).toHaveLength(0);
    });

    it('returns empty when normalisationCenters is empty', () => {
      const { points } = normalisePointsNodeDef.evaluate({
        ...base,
        inputPoints: [pt(0, 0)],
        normalisationCenters: [],
      });
      expect(points).toHaveLength(0);
    });

    it('returns empty when normalisationOrigin is empty', () => {
      const { points } = normalisePointsNodeDef.evaluate({
        ...base,
        inputPoints: [pt(0, 0)],
        normalisationOrigin: [],
      });
      expect(points).toHaveLength(0);
    });
  });

  describe('strength=0 → identity', () => {
    it('returns original positions unchanged for each center/origin combination', () => {
      const { points } = normalisePointsNodeDef.evaluate({
        ...base,
        inputPoints: [pt(0, -0.5), pt(0, 0.5)],
        normalisationCenters: [pt(1, 1), pt(-1, -1)],
        normalisationOrigin: [pt(1, 0)],
        strength: 0,
      });
      // 2 points × 2 centers × 1 origin = 4 output points, all at original positions
      expect(points).toHaveLength(4);
      for (const p of points) {
        const isFirst  = Math.abs(p.y - (-0.5)) < 1e-9 && Math.abs(p.x) < 1e-9;
        const isSecond = Math.abs(p.y - 0.5) < 1e-9  && Math.abs(p.x) < 1e-9;
        expect(isFirst || isSecond).toBe(true);
      }
    });
  });

  describe('normalisation with origin above center → no rotation', () => {
    // origin (0,1) above center (0,0): direction is +y, theta = π/2 - π/2 = 0
    // Vertical unit line stays vertical; scale = 1; translate to (0,0) → no change.
    it('vertical unit line is unchanged when origin is directly above center', () => {
      const { points } = normalisePointsNodeDef.evaluate({
        ...base,
        inputPoints: [pt(0, -0.5), pt(0, 0.5)],
        normalisationCenters: [pt(0, 0)],
        normalisationOrigin: [pt(0, 1)],
        normalisationSize: 1,
        strength: 1,
      });
      expect(points).toHaveLength(2);
      expect(points[0].x).toBeCloseTo(0);
      expect(points[0].y).toBeCloseTo(-0.5);
      expect(points[1].x).toBeCloseTo(0);
      expect(points[1].y).toBeCloseTo(0.5);
    });
  });

  describe('rotation via origin direction', () => {
    // origin (1,0) right of center (0,0): theta = π/2 (CCW 90°)
    // Vertical line (0,±0.5) → horizontal line (±0.5, 0)
    it('origin to the right of center rotates a vertical line to horizontal', () => {
      const { points } = normalisePointsNodeDef.evaluate({
        ...base,
        inputPoints: [pt(0, -0.5), pt(0, 0.5)],
        normalisationCenters: [pt(0, 0)],
        normalisationOrigin: [pt(1, 0)],
        normalisationSize: 1,
        strength: 1,
      });
      expect(points).toHaveLength(2);
      // "top" point (0,-0.5) → (0.5, 0) after CCW 90°
      expect(points[0].x).toBeCloseTo(0.5);
      expect(points[0].y).toBeCloseTo(0);
      // "bottom" point (0,0.5) → (-0.5, 0)
      expect(points[1].x).toBeCloseTo(-0.5);
      expect(points[1].y).toBeCloseTo(0);
    });

    // origin (0,-1) below center: theta = π (flip)
    it('origin below center flips the line (180° rotation)', () => {
      const { points } = normalisePointsNodeDef.evaluate({
        ...base,
        inputPoints: [pt(0, -0.5), pt(0, 0.5)],
        normalisationCenters: [pt(0, 0)],
        normalisationOrigin: [pt(0, -1)],
        normalisationSize: 1,
        strength: 1,
      });
      expect(points).toHaveLength(2);
      // "top" (0,-0.5) → (0, 0.5) after 180° flip
      expect(points[0].x).toBeCloseTo(0);
      expect(points[0].y).toBeCloseTo(0.5);
      expect(points[1].x).toBeCloseTo(0);
      expect(points[1].y).toBeCloseTo(-0.5);
    });

    it('three origins produce three correctly-oriented copies (6 points total)', () => {
      const { points } = normalisePointsNodeDef.evaluate({
        ...base,
        inputPoints: [pt(0, -0.5), pt(0, 0.5)],
        normalisationCenters: [pt(0, 0)],
        normalisationOrigin: [pt(0, 1), pt(1, 0), pt(0, -1)],
        normalisationSize: 1,
        strength: 1,
      });
      expect(points).toHaveLength(6);
      // Origin (0,1): no rotation
      expect(points[0].x).toBeCloseTo(0);   expect(points[0].y).toBeCloseTo(-0.5);
      expect(points[1].x).toBeCloseTo(0);   expect(points[1].y).toBeCloseTo(0.5);
      // Origin (1,0): CCW 90°
      expect(points[2].x).toBeCloseTo(0.5); expect(points[2].y).toBeCloseTo(0);
      expect(points[3].x).toBeCloseTo(-0.5);expect(points[3].y).toBeCloseTo(0);
      // Origin (0,-1): 180°
      expect(points[4].x).toBeCloseTo(0);   expect(points[4].y).toBeCloseTo(0.5);
      expect(points[5].x).toBeCloseTo(0);   expect(points[5].y).toBeCloseTo(-0.5);
    });
  });

  describe('strength lerp', () => {
    // strength=0.5 between (0,±0.5) and (±0.5,0) = (±0.25, ±0.25) with mixed signs
    it('strength=0.5 lerps halfway between original and normalised positions', () => {
      const { points } = normalisePointsNodeDef.evaluate({
        ...base,
        inputPoints: [pt(0, -0.5), pt(0, 0.5)],
        normalisationCenters: [pt(0, 0)],
        normalisationOrigin: [pt(1, 0)],
        normalisationSize: 1,
        strength: 0.5,
      });
      expect(points).toHaveLength(2);
      // (0,-0.5) lerped 50% toward (0.5, 0)
      expect(points[0].x).toBeCloseTo(0.25);
      expect(points[0].y).toBeCloseTo(-0.25);
      // (0,0.5) lerped 50% toward (-0.5, 0)
      expect(points[1].x).toBeCloseTo(-0.25);
      expect(points[1].y).toBeCloseTo(0.25);
    });
  });

  describe('normalisationSize scaling', () => {
    it('normalisationSize=2 doubles the fitted size', () => {
      const { points } = normalisePointsNodeDef.evaluate({
        ...base,
        inputPoints: [pt(0, -0.5), pt(0, 0.5)],
        normalisationCenters: [pt(0, 0)],
        normalisationOrigin: [pt(0, 1)],
        normalisationSize: 2,
        strength: 1,
      });
      expect(points).toHaveLength(2);
      expect(points[0].y).toBeCloseTo(-1);
      expect(points[1].y).toBeCloseTo(1);
    });

    it('normalisationSize=0 collapses all points to the center', () => {
      const { points } = normalisePointsNodeDef.evaluate({
        ...base,
        inputPoints: [pt(0, -0.5), pt(0, 0.5)],
        normalisationCenters: [pt(3, 4)],
        normalisationOrigin: [pt(0, 1)],
        normalisationSize: 0,
        strength: 1,
      });
      expect(points).toHaveLength(2);
      expect(points[0].x).toBeCloseTo(3);
      expect(points[0].y).toBeCloseTo(4);
      expect(points[1].x).toBeCloseTo(3);
      expect(points[1].y).toBeCloseTo(4);
    });
  });

  describe('zero bounding box (coincident input points)', () => {
    it('translates all coincident points to the center', () => {
      const { points } = normalisePointsNodeDef.evaluate({
        ...base,
        inputPoints: [pt(0.3, 0.4), pt(0.3, 0.4)],
        normalisationCenters: [pt(1, 2)],
        normalisationOrigin: [pt(0, 1)],
        normalisationSize: 1,
        strength: 1,
      });
      expect(points).toHaveLength(2);
      expect(points[0].x).toBeCloseTo(1);
      expect(points[0].y).toBeCloseTo(2);
      expect(points[1].x).toBeCloseTo(1);
      expect(points[1].y).toBeCloseTo(2);
    });
  });

  describe('product cardinality', () => {
    it('2 centers × 3 origins × 2 inputs = 12 output points', () => {
      const { points } = normalisePointsNodeDef.evaluate({
        ...base,
        inputPoints: [pt(0, -0.5), pt(0, 0.5)],
        normalisationCenters: [pt(0, 0), pt(1, 0)],
        normalisationOrigin: [pt(0, 1), pt(1, 0), pt(0, -1)],
        normalisationSize: 1,
        strength: 1,
      });
      expect(points).toHaveLength(12);
    });

    it('output is grouped by center then origin (single coincident point goes to each center)', () => {
      // A single coincident point has a zero bounding box — it always lands at the center.
      const { points } = normalisePointsNodeDef.evaluate({
        ...base,
        inputPoints: [pt(0, 0, red)],
        normalisationCenters: [pt(0, 0), pt(2, 0)],
        normalisationOrigin: [pt(0, 1)],
        normalisationSize: 1,
        strength: 1,
      });
      expect(points).toHaveLength(2);
      // center (0,0): single point goes to (0,0)
      expect(points[0].x).toBeCloseTo(0);
      expect(points[0].y).toBeCloseTo(0);
      // center (2,0): single point goes to (2,0)
      expect(points[1].x).toBeCloseTo(2);
      expect(points[1].y).toBeCloseTo(0);
    });
  });

  describe('color preservation', () => {
    it('preserves input point color regardless of center', () => {
      const { points } = normalisePointsNodeDef.evaluate({
        ...base,
        inputPoints: [{ x: 0, y: 0, dx: 0, dy: 0, r: 0.2, g: 0.5, b: 0.8, a: 0.9 }],
        normalisationCenters: [pt(1, 1)],
        normalisationOrigin: [pt(1, 2)],
        normalisationSize: 1,
        strength: 1,
      });
      expect(points[0].r).toBeCloseTo(0.2);
      expect(points[0].g).toBeCloseTo(0.5);
      expect(points[0].b).toBeCloseTo(0.8);
      expect(points[0].a).toBeCloseTo(0.9);
    });
  });

  describe('translation to non-origin center', () => {
    // Vertical unit line centered on (0,0), normalised to center (2,3),
    // origin (2,4) = directly above center → no rotation, points land at (2,2.5) and (2,3.5)
    it('translates fitted points to the normalisation center', () => {
      const { points } = normalisePointsNodeDef.evaluate({
        ...base,
        inputPoints: [pt(0, -0.5), pt(0, 0.5)],
        normalisationCenters: [pt(2, 3)],
        normalisationOrigin: [pt(2, 4)],
        normalisationSize: 1,
        strength: 1,
      });
      expect(points).toHaveLength(2);
      expect(points[0].x).toBeCloseTo(2);
      expect(points[0].y).toBeCloseTo(2.5);
      expect(points[1].x).toBeCloseTo(2);
      expect(points[1].y).toBeCloseTo(3.5);
    });
  });
});
