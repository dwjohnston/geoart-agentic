import { describe, it, expect } from 'vitest';
import { colorPickerNodeDef } from './ColorPickerNode';

describe('colorPicker node', () => {
  function evaluate(params: Record<string, { v: unknown }>) {
    const result = colorPickerNodeDef.evaluate(params);
    return result[0] as { kind: string; v: { r: number; g: number; b: number; a: number } };
  }

  it('returns default white when params are empty', () => {
    const result = evaluate({});
    expect(result.kind).toBe('color');
    expect(result.v).toEqual({ r: 1, g: 1, b: 1, a: 1 });
  });

  it('returns provided color value', () => {
    const color = { r: 0.2, g: 0.4, b: 0.6, a: 1 };
    const result = evaluate({ value: { v: color } });
    expect(result.v).toEqual(color);
  });

  it('has color output port', () => {
    expect(colorPickerNodeDef.outputs).toEqual([{ name: 'value', type: 'color' }]);
  });
});
