import { describe, it, expect } from 'bun:test';
import sliderNodeImplementation from './Slider';

describe('slider node', () => {
  it('has the correct node kind', () => {
    expect(sliderNodeImplementation.nodeKind).toBe('slider');
  });

  it('has correct default value', () => {
    expect(sliderNodeImplementation.defaultValues.value).toBe(0);
  });

  it('has correct default min and max', () => {
    expect(sliderNodeImplementation.defaultValues.min).toBe(0);
    expect(sliderNodeImplementation.defaultValues.max).toBe(1);
  });
});
