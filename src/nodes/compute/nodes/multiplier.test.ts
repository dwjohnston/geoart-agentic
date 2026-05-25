import { describe, expect, test } from 'bun:test';
import multiplierNodeImplementation from './multiplier';



describe('multiplierNodeImplementation', () => {
  test('1 × 1 = 1', () => {
    const result = multiplierNodeImplementation.evaluate({ a: 2, b: 3 });
    expect(result).toEqual({ "product": 6 })
  });

});
