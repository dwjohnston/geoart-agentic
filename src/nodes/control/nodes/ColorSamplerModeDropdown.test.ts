import { describe, it, expect } from 'bun:test';
import colorSamplerModeDropdownDef from './ColorSamplerModeDropdown';

describe('colorSamplerModeSelector node', () => {
  it('has the correct node kind', () => {
    expect(colorSamplerModeDropdownDef.nodeKind).toBe('colorSamplerModeSelector');
  });

  it('has correct default mode value', () => {
    expect(colorSamplerModeDropdownDef.defaultValues.mode).toBe('clobber');
  });
});
