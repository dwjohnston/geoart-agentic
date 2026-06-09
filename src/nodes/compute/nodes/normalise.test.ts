import { describe, expect, test } from 'bun:test';
import normaliseNodeImplementation, { applyNormalise } from './normalise';

type CP = { x: number; y: number; dx: number; dy: number; r: number | null; g: number | null; b: number | null; a: number | null };

function cp(x: number, y: number): CP {
  return { x, y, dx: 0, dy: 0, r: 1, g: 1, b: 1, a: 1 };
}

function coloredCp(x: number, y: number, r: number, g: number, b: number, a: number): CP {
  return { x, y, dx: 0, dy: 0, r, g, b, a };
}

describe('normaliseNodeImplementation defaults', () => {
  test('empty inputs produce empty output', () => {
    const result = normaliseNodeImplementation.evaluate({
      inputPoints: [],
      normalisationCenters: [],
      normalisationSize: 1,
      strength: 0,
      mode: 'product',
    });
    expect(result.points).toEqual([]);
  });
});

describe('applyNormalise – product mode', () => {
  test('strength=0 is identity', () => {
    const input = [cp(-0.5, -0.5), cp(0.5, -0.5), cp(0.5, 0.5), cp(-0.5, 0.5)];
    const centers = [cp(-0.5, -0.5)];
    const result = applyNormalise(input, centers, 1.0, 0, 'product');
    expect(result).toEqual(input);
  });

  test('single center, strength=1, unit square → bottom-left quadrant', () => {
    // 1×1 square centered at origin, normalised into bottom-left quadrant
    const input = [cp(-0.5, -0.5), cp(0.5, -0.5), cp(0.5, 0.5), cp(-0.5, 0.5)];
    const centers = [cp(-0.5, -0.5)];
    const result = applyNormalise(input, centers, 1.0, 1.0, 'product');
    expect(result).toHaveLength(4);
    expect(result[0]).toMatchObject({ x: -1, y: -1 });
    expect(result[1]).toMatchObject({ x: 0, y: -1 });
    expect(result[2]).toMatchObject({ x: 0, y: 0 });
    expect(result[3]).toMatchObject({ x: -1, y: 0 });
  });

  test('output colors inherit from input points, not centers', () => {
    const input = [coloredCp(0, 0, 1, 0, 0, 1)];
    const centers = [coloredCp(0.5, 0.5, 0, 0, 1, 1)];
    const [out] = applyNormalise(input, centers, 1.0, 1.0, 'product');
    expect(out.r).toBe(1);
    expect(out.g).toBe(0);
    expect(out.b).toBe(0);
    expect(out.a).toBe(1);
  });

  test('three centers produce N×3 output points', () => {
    const input = [cp(0, 0), cp(1, 0), cp(1, 1), cp(0, 1)];
    const centers = [cp(-0.5, 0.5), cp(0.5, 0.5), cp(-0.5, -0.5)];
    const result = applyNormalise(input, centers, 1.0, 1.0, 'product');
    expect(result).toHaveLength(12);
  });

  test('empty centers produces empty output in product mode', () => {
    const result = applyNormalise([cp(0, 0)], [], 1.0, 1.0, 'product');
    expect(result).toHaveLength(0);
  });
});

describe('applyNormalise – sequential mode', () => {
  test('preserves input cardinality (N out for N in)', () => {
    const input = [cp(-0.5, -0.5), cp(0.5, -0.5), cp(0.5, 0.5), cp(-0.5, 0.5)];
    const centers = [cp(-0.5, -0.5), cp(0.5, 0.5)];
    const result = applyNormalise(input, centers, 0.6, 0.5, 'sequential');
    expect(result).toHaveLength(4);
  });

  test('empty centers in sequential mode returns input unchanged', () => {
    const input = [cp(0.1, 0.2), cp(-0.3, 0.4)];
    const result = applyNormalise(input, [], 1.0, 1.0, 'sequential');
    expect(result).toEqual(input);
  });

  test('two passes progressively shift the cloud', () => {
    // 1×1 square centered at origin
    const input = [cp(-0.5, -0.5), cp(0.5, -0.5), cp(0.5, 0.5), cp(-0.5, 0.5)];
    const centers = [cp(0, 0), cp(0, 0)];
    // pass 1: normalise size=1, strength=1, center=(0,0) → same points (bbox center = origin)
    // pass 2: same — still centered at origin
    const result = applyNormalise(input, centers, 1.0, 1.0, 'sequential');
    // output should equal input since center equals bbox center
    expect(result).toEqual(input);
  });
});

describe('applyNormalise – degenerate inputs', () => {
  test('single input point: degenerate bbox maps point to center', () => {
    const input = [cp(0.3, 0.4)];
    const centers = [cp(0, 0)];
    // bbox is degenerate (0×0), scale = 1
    // bboxCenter = (0.3, 0.4)
    // normalised = center + (p - bboxCenter) * 1 = (0,0) + (0.3-0.3, 0.4-0.4) = (0, 0)
    // lerp(0.3, 0, 1) = 0
    const result = applyNormalise(input, centers, 1.0, 1.0, 'product');
    expect(result).toHaveLength(1);
    expect(result[0].x).toBeCloseTo(0);
    expect(result[0].y).toBeCloseTo(0);
  });

  test('empty input produces empty output regardless of mode', () => {
    const centers = [cp(0, 0)];
    expect(applyNormalise([], centers, 1.0, 1.0, 'product')).toHaveLength(0);
    expect(applyNormalise([], centers, 1.0, 1.0, 'sequential')).toHaveLength(0);
  });
});

describe('applyNormalise – strength interpolation', () => {
  test('strength=0.5 lerps halfway between original and normalised', () => {
    // 1×1 square (2 corner points), center=(-0.5,-0.5), size=1
    const input = [cp(-0.5, -0.5), cp(0.5, 0.5)];
    const centers = [cp(-0.5, -0.5)];
    const result = applyNormalise(input, centers, 1.0, 0.5, 'product');
    // bboxCenter = (0,0), scale = 1
    // normalised(-0.5,-0.5) = (-0.5 + (-0.5-0)*1, -0.5 + (-0.5-0)*1) = (-1,-1)
    // normalised(0.5,0.5)   = (-0.5 + (0.5-0)*1,  -0.5 + (0.5-0)*1)  = (0,0)
    // lerp at 0.5:
    expect(result[0].x).toBeCloseTo(-0.75); // lerp(-0.5, -1, 0.5)
    expect(result[0].y).toBeCloseTo(-0.75);
    expect(result[1].x).toBeCloseTo(0.25);  // lerp(0.5, 0, 0.5)
    expect(result[1].y).toBeCloseTo(0.25);
  });
});
