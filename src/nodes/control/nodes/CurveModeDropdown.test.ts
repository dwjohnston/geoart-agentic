import { describe, it, expect } from 'bun:test';
import { curveModeDropdownDef } from './CurveModeDropdown';

describe('curveModeSelector node', () => {
  it('has the correct node kind', () => {
    expect(curveModeDropdownDef.nodeKind).toBe('curveModeSelector');
  });

  it('has correct default value', () => {
    expect(curveModeDropdownDef.defaultValues.value).toBe('straight');
  });
});
