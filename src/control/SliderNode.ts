import type { ControlNodeDef } from './types';

export const sliderNodeDef: ControlNodeDef = {
  type: 'slider',
  outputs: [{ name: 'value', type: 'number' }],
  params: {
    label: { type: 'string' },
    min:   { type: 'number' },
    max:   { type: 'number' },
    value: { type: 'number' },
  },
  evaluate(params) {
    return [{ kind: 'number', v: (params['value']?.v as number) ?? 0 }];
  },
};
