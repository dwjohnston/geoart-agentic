import { describe, it, expect } from 'vitest';
import { addNodeImplementation } from './add.node';

describe('add node', () => {


  it("future state tests", () => {
    expect(addNodeImplementation.evaluate({ a: 1, b: 2 })).toEqual({
      sum: 3
    })
  })

});
