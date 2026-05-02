import { describe, it, expect } from 'vitest';
import { addNodeDef } from './add.node';

describe('add node', () => {


  it("future state tests", () => {
    expect(addNodeDef.evaluate({ a: 1, b: 2 })).toEqual({
      sum: 3
    })
  })

});
