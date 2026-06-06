import { describe, it, expect } from 'bun:test';
import normaliseModeDropdownDef from './NormaliseModeDropdown';

describe('normaliseModeSelector node', () => {
  it('has the correct node kind', () => {
    expect(normaliseModeDropdownDef.nodeKind).toBe('normaliseModeSelector');
  });

  it('has correct default value', () => {
    expect(normaliseModeDropdownDef.defaultValues.value).toBe('product');
  });
});
