import { describe, it, expect } from 'vitest';
import colorPickerNodeImplementation from './ColorPicker';

describe('colorPicker node', () => {
  it('has the correct node kind', () => {
    expect(colorPickerNodeImplementation.nodeKind).toBe('colorPicker');
  });

  it('has correct default color value', () => {
    expect(colorPickerNodeImplementation.defaultValues.value).toEqual({ r: 1, g: 1, b: 1, a: 1 });
  });

  it('has correct default label', () => {
    expect(colorPickerNodeImplementation.defaultValues.label).toBe('');
  });
});
