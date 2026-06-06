import { describe, it, expect } from 'bun:test';
import normaliseNodeImplementation from './normalise';

const makePoint = (x: number, y: number) => ({
  x, y, r: 1 as number | null, g: 1 as number | null, b: 1 as number | null, a: 1 as number | null, dx: 0, dy: 0,
});

const makeCenter = (x: number, y: number) => ({
  x, y, r: null as number | null, g: null as number | null, b: null as number | null, a: null as number | null, dx: 0, dy: 0,
});

describe('normalise node', () => {
  it('returns empty array when inputPoints is empty', () => {
    const result = normaliseNodeImplementation.evaluate({
      inputPoints: [],
      normalisationCenters: [makeCenter(0.5, 0.5)],
      normalisationSize: 1,
      strength: 1,
      mode: 'product',
    });
    expect(result.points).toEqual([]);
  });

  it('returns inputPoints unchanged when normalisationCenters is empty', () => {
    const input = [makePoint(0, 0), makePoint(1, 1)];
    const result = normaliseNodeImplementation.evaluate({
      inputPoints: input,
      normalisationCenters: [],
      normalisationSize: 1,
      strength: 1,
      mode: 'product',
    });
    expect(result.points).toEqual(input);
  });

  it('returns original positions when strength is 0 (identity)', () => {
    const input = [makePoint(0.1, 0.2), makePoint(0.8, 0.9)];
    const result = normaliseNodeImplementation.evaluate({
      inputPoints: input,
      normalisationCenters: [makeCenter(0.5, 0.5)],
      normalisationSize: 0.2,
      strength: 0,
      mode: 'product',
    });
    expect(result.points[0].x).toBeCloseTo(0.1);
    expect(result.points[0].y).toBeCloseTo(0.2);
    expect(result.points[1].x).toBeCloseTo(0.8);
    expect(result.points[1].y).toBeCloseTo(0.9);
  });

  it('fits points to single center at full strength (product)', () => {
    // Two points from (0,0) to (2,0) — bounding box center (1,0), width 2
    // normalisationSize 1 → scale 0.5, center (0.5, 0.5)
    // normX for (0,0): (0-1)*0.5 + 0.5 = 0
    // normY for (0,0): (0-0)*0.5 + 0.5 = 0.5
    // normX for (2,0): (2-1)*0.5 + 0.5 = 1
    // normY for (2,0): (0-0)*0.5 + 0.5 = 0.5
    const input = [makePoint(0, 0), makePoint(2, 0)];
    const result = normaliseNodeImplementation.evaluate({
      inputPoints: input,
      normalisationCenters: [makeCenter(0.5, 0.5)],
      normalisationSize: 1,
      strength: 1,
      mode: 'product',
    });
    expect(result.points).toHaveLength(2);
    expect(result.points[0].x).toBeCloseTo(0);
    expect(result.points[0].y).toBeCloseTo(0.5);
    expect(result.points[1].x).toBeCloseTo(1);
    expect(result.points[1].y).toBeCloseTo(0.5);
  });

  it('product mode with 2 centers produces N×M points', () => {
    const input = [makePoint(0, 0), makePoint(1, 1), makePoint(2, 0)];
    const result = normaliseNodeImplementation.evaluate({
      inputPoints: input,
      normalisationCenters: [makeCenter(0.3, 0.3), makeCenter(0.7, 0.7)],
      normalisationSize: 0.5,
      strength: 1,
      mode: 'product',
    });
    expect(result.points).toHaveLength(6);
  });

  it('sequential mode with 2 centers produces N points', () => {
    const input = [makePoint(0, 0), makePoint(1, 1), makePoint(2, 0)];
    const result = normaliseNodeImplementation.evaluate({
      inputPoints: input,
      normalisationCenters: [makeCenter(0.3, 0.3), makeCenter(0.7, 0.7)],
      normalisationSize: 0.5,
      strength: 1,
      mode: 'sequential',
    });
    expect(result.points).toHaveLength(3);
  });

  it('sequential mode: second center normalises result of first', () => {
    // Two points (0,0) and (2,2), sequential through (0,0) then (1,1)
    // After (0,0): bounding box center (1,1), size 2, scale 0.5
    //   (0,0) → (-0.5,-0.5), (2,2) → (0.5,0.5)
    // After (1,1): bounding box center (0,0), size 1, scale 1
    //   (-0.5,-0.5) → (0.5,0.5), (0.5,0.5) → (1.5,1.5)
    const input = [makePoint(0, 0), makePoint(2, 2)];
    const result = normaliseNodeImplementation.evaluate({
      inputPoints: input,
      normalisationCenters: [makeCenter(0, 0), makeCenter(1, 1)],
      normalisationSize: 1,
      strength: 1,
      mode: 'sequential',
    });
    expect(result.points[0].x).toBeCloseTo(0.5);
    expect(result.points[0].y).toBeCloseTo(0.5);
    expect(result.points[1].x).toBeCloseTo(1.5);
    expect(result.points[1].y).toBeCloseTo(1.5);
  });

  it('single input point: translates to center without scaling', () => {
    const input = [makePoint(0.2, 0.3)];
    const result = normaliseNodeImplementation.evaluate({
      inputPoints: input,
      normalisationCenters: [makeCenter(0.8, 0.7)],
      normalisationSize: 0.5,
      strength: 1,
      mode: 'product',
    });
    expect(result.points[0].x).toBeCloseTo(0.8);
    expect(result.points[0].y).toBeCloseTo(0.7);
  });

  it('preserves color channels', () => {
    const input = [{ x: 0, y: 0, r: 0.5 as number | null, g: 0.3 as number | null, b: 0.1 as number | null, a: 0.9 as number | null, dx: 0, dy: 0 }];
    const result = normaliseNodeImplementation.evaluate({
      inputPoints: input,
      normalisationCenters: [makeCenter(0.5, 0.5)],
      normalisationSize: 1,
      strength: 1,
      mode: 'product',
    });
    expect(result.points[0].r).toBeCloseTo(0.5);
    expect(result.points[0].g).toBeCloseTo(0.3);
    expect(result.points[0].b).toBeCloseTo(0.1);
    expect(result.points[0].a).toBeCloseTo(0.9);
  });

  it('preserves null color channels', () => {
    const input = [{ x: 0, y: 0, r: null as number | null, g: null as number | null, b: null as number | null, a: null as number | null, dx: 0, dy: 0 }];
    const result = normaliseNodeImplementation.evaluate({
      inputPoints: input,
      normalisationCenters: [makeCenter(0.5, 0.5)],
      normalisationSize: 1,
      strength: 1,
      mode: 'product',
    });
    expect(result.points[0].r).toBeNull();
    expect(result.points[0].g).toBeNull();
    expect(result.points[0].b).toBeNull();
    expect(result.points[0].a).toBeNull();
  });

  it('clamps strength above 1 to 1', () => {
    const input = [makePoint(0, 0), makePoint(2, 0)];
    const unclamped = normaliseNodeImplementation.evaluate({
      inputPoints: input,
      normalisationCenters: [makeCenter(0.5, 0.5)],
      normalisationSize: 1,
      strength: 2,
      mode: 'product',
    });
    const clamped = normaliseNodeImplementation.evaluate({
      inputPoints: input,
      normalisationCenters: [makeCenter(0.5, 0.5)],
      normalisationSize: 1,
      strength: 1,
      mode: 'product',
    });
    expect(unclamped.points[0].x).toBeCloseTo(clamped.points[0].x);
    expect(unclamped.points[0].y).toBeCloseTo(clamped.points[0].y);
  });
});
