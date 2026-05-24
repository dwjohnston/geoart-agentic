import { describe, it, expect } from 'bun:test';
import dropdownNodeImplementation from './Dropdown';

describe('dropdown node', () => {
  it('has the correct node kind', () => {
    expect(dropdownNodeImplementation.nodeKind).toBe('dropdown');
  });

  it('has correct default value', () => {
    expect(dropdownNodeImplementation.defaultValues.value).toBe('');
  });
});
