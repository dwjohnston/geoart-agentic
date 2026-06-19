import { describe, expect, test } from 'bun:test';
import { applyNormalise } from './src/nodes/compute/nodes/normalise';

type CP = { x: number; y: number; dx: number; dy: number; r: number | null; g: number | null; b: number | null; a: number | null };

function cp(x: number, y: number): CP {
  return { x, y, dx: 0, dy: 0, r: 1, g: 1, b: 1, a: 1 };
}

describe('normalise — product mode', () => {
  test('strength=0 is identity', () => {
    const input = [cp(-0.5, -0.5), cp(0.5, -0.5), cp(0.5, 0.5), cp(-0.5, 0.5)];
    const result = applyNormalise(input, [cp(0, 0)], 1, 0, 'product');
    expect(result).toEqual(input);
  });

  test('single center, strength=1: fits unit square to bottom-left quadrant', () => {
    const input = [cp(-0.5, -0.5), cp(0.5, -0.5), cp(0.5, 0.5), cp(-0.5, 0.5)];
    const result = applyNormalise(input, [cp(-0.5, -0.5)], 1, 1, 'product');
    expect(result).toHaveLength(4);
    expect(result[0]).toMatchObject({ x: -1, y: -1 });
    expect(result[1]).toMatchObject({ x: 0, y: -1 });
    expect(result[2]).toMatchObject({ x: 0, y: 0 });
    expect(result[3]).toMatchObject({ x: -1, y: 0 });
  });

  test('two centers produce 2× output points', () => {
    const input = [cp(0, 0), cp(1, 0)];
    const result = applyNormalise(input, [cp(-1, 0), cp(1, 0)], 1, 1, 'product');
    expect(result).toHaveLength(4);
  });

  test('output colors come from input points, not centers', () => {
    const input = [{ x: 0, y: 0, dx: 0, dy: 0, r: 1, g: 0, b: 0, a: 1 }];
    const centers = [{ x: 0.5, y: 0.5, dx: 0, dy: 0, r: 0, g: 0, b: 1, a: 1 }];
    const [out] = applyNormalise(input, centers, 1, 1, 'product');
    expect(out!.r).toBe(1);
    expect(out!.b).toBe(0);
  });

  test('no centers returns empty array', () => {
    const result = applyNormalise([cp(0, 0)], [], 1, 1, 'product');
    expect(result).toEqual([]);
  });
});

describe('normalise — sequential mode', () => {
  test('preserves point count', () => {
    const input = [cp(-0.5, -0.5), cp(0.5, -0.5), cp(0.5, 0.5), cp(-0.5, 0.5)];
    const centers = [cp(0, 0), cp(0.25, 0.25)];
    const result = applyNormalise(input, centers, 1, 1, 'sequential');
    expect(result).toHaveLength(4);
  });

  test('no centers returns input unchanged', () => {
    const input = [cp(0, 0), cp(1, 1)];
    const result = applyNormalise(input, [], 1, 1, 'sequential');
    expect(result).toEqual(input);
  });
});
