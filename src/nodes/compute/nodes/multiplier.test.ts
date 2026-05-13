import { describe, expect, test } from 'bun:test';
import { multiplierNodeDef } from './multiplier.node';



describe('multiplierNodeDef', () => {
  test('1 × 1 = 1', () => {
    const result = multiplierNodeDef.evaluate({ a: 2, b: 3 });
    expect(result).toEqual({ "product": 6 })
  });

});
