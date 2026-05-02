import { describe, expect, test } from 'vitest';
import { colorPointNodeDef } from './colorPointCompute.node';

describe('colorPointNodeDef', () => {
  test('combines point position with color', () => {
    const { colorPoint } = colorPointNodeDef.evaluate({
      point: { x: 0.5, y: -0.3 },
      color: { r: 1, g: 0, b: 0, a: 1 },
    });
    expect(colorPoint).toEqual({ x: 0.5, y: -0.3, r: 1, g: 0, b: 0, a: 1 });
  });


});
