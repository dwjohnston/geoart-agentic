import { describe, expect, test } from 'bun:test';
import { colorPointNodeDef } from './colorPointCompute.node';

describe('colorPointNodeDef', () => {
  test('combines point position with color', () => {
    const { colorPoint } = colorPointNodeDef.evaluate({
      point: { x: 0.5, y: -0.3 },
      color: { r: 1, g: 0, b: 0, a: 1 },
      dx: 0,
      dy: 0,
    });
    expect(colorPoint).toEqual({ x: 0.5, y: -0.3, r: 1, g: 0, b: 0, a: 1, dx: 0, dy: 0 });
  });

  test('accepts optional tangent inputs', () => {
    const { colorPoint } = colorPointNodeDef.evaluate({
      point: { x: 0.5, y: -0.3 },
      color: { r: 1, g: 0, b: 0, a: 1 },
      dx: 1.0,
      dy: -0.5,
    });
    expect(colorPoint).toEqual({ x: 0.5, y: -0.3, r: 1, g: 0, b: 0, a: 1, dx: 1.0, dy: -0.5 });
  });
});

