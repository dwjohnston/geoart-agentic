import { describe, expect, it } from 'bun:test';
import normaliseNodeImplementation from './normalise';

const makePoint = (x: number, y: number) => ({
  x, y, r: 1, g: 0, b: 0, a: 1, dx: 0, dy: 0,
});

const center = makePoint(0.5, 0.5);

describe('normaliseNodeImplementation', () => {
  describe('strength: 0 (identity)', () => {
    it('returns input points unchanged when strength is 0', () => {
      const inputPoints = [makePoint(1, 2), makePoint(3, 4), makePoint(5, 6)];
      const { points } = normaliseNodeImplementation.evaluate({
        inputPoints,
        normalisationCenters: [center],
        normalisationSize: 1,
        strength: 0,
        mode: 'product',
      });

      expect(points).toHaveLength(3);
      for (let i = 0; i < inputPoints.length; i++) {
        expect(points[i].x).toBeCloseTo(inputPoints[i].x);
        expect(points[i].y).toBeCloseTo(inputPoints[i].y);
      }
    });
  });

  describe('strength: 1, single center, product mode', () => {
    it('output points fit within the expected bounding box centred on the center', () => {
      // A square of points from (-1,-1) to (1,1) — range = 2
      // normalisationSize = 1 → scale = 0.5
      // Centred on (0.5, 0.5), fully normalised (strength=1)
      const inputPoints = [
        makePoint(-1, -1),
        makePoint(1, -1),
        makePoint(1, 1),
        makePoint(-1, 1),
      ];

      const { points } = normaliseNodeImplementation.evaluate({
        inputPoints,
        normalisationCenters: [center],
        normalisationSize: 1,
        strength: 1,
        mode: 'product',
      });

      expect(points).toHaveLength(4);

      const xs = points.map(p => p.x);
      const ys = points.map(p => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      // Bounding box should be centred on (0.5, 0.5)
      expect((minX + maxX) / 2).toBeCloseTo(0.5);
      expect((minY + maxY) / 2).toBeCloseTo(0.5);

      // Bounding box side length should equal normalisationSize = 1
      expect(maxX - minX).toBeCloseTo(1);
      expect(maxY - minY).toBeCloseTo(1);
    });

    it('non-square input — largest dimension determines scale', () => {
      // Points spanning x: 0-4, y: 0-2 → range = 4, scale = 0.5
      const inputPoints = [
        makePoint(0, 0),
        makePoint(4, 0),
        makePoint(4, 2),
        makePoint(0, 2),
      ];

      const { points } = normaliseNodeImplementation.evaluate({
        inputPoints,
        normalisationCenters: [makePoint(0, 0)],
        normalisationSize: 2,
        strength: 1,
        mode: 'product',
      });

      const xs = points.map(p => p.x);
      const ys = points.map(p => p.y);
      const maxX = Math.max(...xs);
      const minX = Math.min(...xs);
      const maxY = Math.max(...ys);
      const minY = Math.min(...ys);

      // Largest dimension (x) should span normalisationSize=2
      expect(maxX - minX).toBeCloseTo(2);
      // y dimension should be scaled proportionally: 2/4 * 2 = 1
      expect(maxY - minY).toBeCloseTo(1);
    });
  });

  describe('product mode with 2 centers', () => {
    it('produces 2× the number of input points', () => {
      const inputPoints = [makePoint(0, 0), makePoint(1, 0), makePoint(0.5, 1)];
      const centers = [makePoint(-0.5, 0), makePoint(0.5, 0)];

      const { points } = normaliseNodeImplementation.evaluate({
        inputPoints,
        normalisationCenters: centers,
        normalisationSize: 1,
        strength: 1,
        mode: 'product',
      });

      expect(points).toHaveLength(inputPoints.length * centers.length);
    });

    it('each group is centred on its respective center', () => {
      const inputPoints = [makePoint(-1, 0), makePoint(1, 0)];
      const centerA = makePoint(-0.5, 0);
      const centerB = makePoint(0.5, 0);

      const { points } = normaliseNodeImplementation.evaluate({
        inputPoints,
        normalisationCenters: [centerA, centerB],
        normalisationSize: 1,
        strength: 1,
        mode: 'product',
      });

      // First group (centred on centerA)
      const groupA = points.slice(0, 2);
      const midAX = (groupA[0].x + groupA[1].x) / 2;
      expect(midAX).toBeCloseTo(centerA.x);

      // Second group (centred on centerB)
      const groupB = points.slice(2, 4);
      const midBX = (groupB[0].x + groupB[1].x) / 2;
      expect(midBX).toBeCloseTo(centerB.x);
    });
  });

  describe('sequential mode', () => {
    it('applies each center in sequence rather than duplicating', () => {
      const inputPoints = [makePoint(-1, -1), makePoint(1, 1)];
      const centers = [makePoint(0, 0), makePoint(0.2, 0.2)];

      const { points } = normaliseNodeImplementation.evaluate({
        inputPoints,
        normalisationCenters: centers,
        normalisationSize: 1,
        strength: 1,
        mode: 'sequential',
      });

      // Sequential does not duplicate — output count equals input count
      expect(points).toHaveLength(inputPoints.length);
    });
  });

  describe('edge cases', () => {
    it('empty inputPoints returns empty output', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        inputPoints: [],
        normalisationCenters: [center],
        normalisationSize: 1,
        strength: 1,
        mode: 'product',
      });
      expect(points).toHaveLength(0);
    });

    it('empty normalisationCenters returns input points unchanged', () => {
      const inputPoints = [makePoint(1, 2), makePoint(3, 4)];
      const { points } = normaliseNodeImplementation.evaluate({
        inputPoints,
        normalisationCenters: [],
        normalisationSize: 1,
        strength: 1,
        mode: 'product',
      });
      expect(points).toEqual(inputPoints);
    });

    it('single point with range=0 does not crash and moves to center', () => {
      const { points } = normaliseNodeImplementation.evaluate({
        inputPoints: [makePoint(5, 5)],
        normalisationCenters: [center],
        normalisationSize: 1,
        strength: 1,
        mode: 'product',
      });
      expect(points).toHaveLength(1);
      // With range=0, scale=1. cx=cy=5. nx = center.x + (5-5)*1 = 0.5
      expect(points[0].x).toBeCloseTo(0.5);
      expect(points[0].y).toBeCloseTo(0.5);
    });

    it('preserves color and tangent fields from input', () => {
      const inputPoint = { x: 0, y: 0, r: 0.2, g: 0.4, b: 0.6, a: 0.8, dx: 1, dy: 0 };
      const { points } = normaliseNodeImplementation.evaluate({
        inputPoints: [inputPoint],
        normalisationCenters: [center],
        normalisationSize: 1,
        strength: 1,
        mode: 'product',
      });
      expect(points[0].r).toBe(0.2);
      expect(points[0].g).toBe(0.4);
      expect(points[0].b).toBe(0.6);
      expect(points[0].a).toBe(0.8);
      expect(points[0].dx).toBe(1);
      expect(points[0].dy).toBe(0);
    });
  });
});
