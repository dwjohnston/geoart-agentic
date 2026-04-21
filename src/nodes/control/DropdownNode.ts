import type { ControlNodeDef } from './types';

export const dropdownNodeDef: ControlNodeDef = {
  type: 'dropdown',
  outputs: [{ name: 'value', type: 'string' }],
  params: {
    label:   { type: 'string' },
    options: { type: 'string' },
    value:   { type: 'string' },
  },
  evaluate(params) {
    return [{ kind: 'string', v: (params['value']?.v as string) ?? '' }];
  },
};
