import { describe, it, expect } from 'bun:test';
import { sliderNodeDef } from './SliderNode';

describe('slider node', () => {
  it('has the correct node kind', () => {
    expect(sliderNodeDef.nodeKind).toBe('slider');
  });

  it('has correct default value', () => {
    expect(sliderNodeDef.defaultValues.value).toBe(0);
  });

  it('has correct default min and max', () => {
    expect(sliderNodeDef.defaultValues.min).toBe(0);
    expect(sliderNodeDef.defaultValues.max).toBe(1);
  });
});
