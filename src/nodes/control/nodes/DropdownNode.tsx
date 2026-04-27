import type { ControlNodeDef } from '../types';
import type { ControlNode } from '../../../schema/_generated/schema-types';
import { DropdownControl } from '../ui/DropdownControl';

type DropdownNode = Extract<ControlNode, { type: 'dropdown' }>;

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
  renderControl(node, set) {
    const n = node as DropdownNode;
    const options = n.params.options?.v ?? [];
    return (
      <DropdownControl
        id={n.id}
        label={n.params.label?.v ?? ''}
        options={options}
        initialValue={n.params.value?.v ?? options[0] ?? ''}
        onChange={v => set('value', { kind: 'string', v })}
      />
    );
  },
};
