import { describe, expect, test } from 'bun:test';
import type { NodeInputsResolved } from '../../../schema/typeHelpers';
import colorPointNodeDef from './colorPointCompute.node';

const base = {
  point: { x: 0, y: 0 },
  color: { r: 1, g: 1, b: 1, a: 1 },
  r: 1,
  g: 1,
  b: 1,
  a: 1,
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
} satisfies NodeInputsResolved<"colorPointCompute">;

describe('colorPointNodeDef', () => {
  test('uses the new flat params when the deprecated params are unset', () => {
    const result = colorPointNodeDef.evaluate({
      ...base,
      x: 0.5,
      y: -0.3,
      r: 1,
      g: 0,
      b: 0,
      a: 1,
    });
    const expected = { x: 0.5, y: -0.3, r: 1, g: 0, b: 0, a: 1, dx: 0, dy: 0 };
    expect(result.colorPoint).toEqual(expected);
    expect(result.points).toEqual([expected]);
  });

  test('accepts optional tangent inputs', () => {
    const result = colorPointNodeDef.evaluate({
      ...base,
      x: 0.5,
      y: -0.3,
      r: 1,
      g: 0,
      b: 0,
      a: 1,
      dx: 1.0,
      dy: -0.5,
    });
    const expected = { x: 0.5, y: -0.3, r: 1, g: 0, b: 0, a: 1, dx: 1.0, dy: -0.5 };
    expect(result.colorPoint).toEqual(expected);
    expect(result.points).toEqual([expected]);
  });

  test('falls back to the deprecated point/color params when they are provided', () => {
    const result = colorPointNodeDef.evaluate({
      ...base,
      point: { x: 0.25, y: 0.75 },
      color: { r: 0.1, g: 0.2, b: 0.3, a: 0.4 },
    });
    const expected = { x: 0.25, y: 0.75, r: 0.1, g: 0.2, b: 0.3, a: 0.4, dx: 0, dy: 0 };
    expect(result.colorPoint).toEqual(expected);
    expect(result.points).toEqual([expected]);
  });

  test('deprecated params take precedence over flat params when both are set', () => {
    const result = colorPointNodeDef.evaluate({
      ...base,
      point: { x: 0.9, y: 0.8 },
      color: { r: 0.5, g: 0.5, b: 0.5, a: 0.5 },
      x: 0.1,
      y: 0.2,
      r: 0,
      g: 0,
      b: 0,
      a: 0,
    });
    const expected = { x: 0.9, y: 0.8, r: 0.5, g: 0.5, b: 0.5, a: 0.5, dx: 0, dy: 0 };
    expect(result.colorPoint).toEqual(expected);
    expect(result.points).toEqual([expected]);
  });

  test('colorPoints always contains exactly one colorPoint', () => {
    const result = colorPointNodeDef.evaluate({ ...base });
    expect(result.points).toHaveLength(1);
    expect(result.points[0]).toEqual(result.colorPoint);
  });
});
