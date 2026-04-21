import type { ControlNodeDef } from './types';

export const colorPickerNodeDef: ControlNodeDef = {
  type: 'colorPicker',
  outputs: [{ name: 'value', type: 'color' }],
  params: {
    label: { type: 'string' },
    value: { type: 'color' },
  },
  evaluate(params) {
    const v = params['value']?.v as { r: number; g: number; b: number; a: number } | undefined;
    return [{
      kind: 'color',
      v: v ?? { r: 1, g: 1, b: 1, a: 1 },
    }];
  },
};
