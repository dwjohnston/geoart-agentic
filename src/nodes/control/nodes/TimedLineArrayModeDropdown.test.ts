import { describe, it, expect } from 'bun:test';
import { timedLineArrayModeDropdownDef } from './TimedLineArrayModeDropdown';

describe('timedLineArrayModeSelector node', () => {
  it('has the correct node kind', () => {
    expect(timedLineArrayModeDropdownDef.nodeKind).toBe('timedLineArrayModeSelector');
  });

  it('has correct default value', () => {
    expect(timedLineArrayModeDropdownDef.defaultValues.value).toBe('all-to-all');
  });
});
