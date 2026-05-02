import { describe, it, expect } from 'vitest';
import { dropdownNodeDef } from './DropdownNode';

describe('dropdown node', () => {
  function evaluate(params: Record<string, { v: unknown }>) {
    const result = dropdownNodeDef.evaluate(params);
    return result[0] as { kind: string; v: string };
  }

  it('returns empty string default when params are empty', () => {
    const result = evaluate({});
    expect(result.kind).toBe('string');
    expect(result.v).toBe('');
  });

  it('returns provided value', () => {
    const result = evaluate({ value: { v: 'option-a' } });
    expect(result.v).toBe('option-a');
  });

  it('has string output port', () => {
    expect(dropdownNodeDef.outputs).toEqual([{ name: 'value', type: 'string' }]);
  });
});
