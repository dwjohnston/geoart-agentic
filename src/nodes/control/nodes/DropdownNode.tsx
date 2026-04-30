import type { ControlNodeDef } from '../types';
import { DropdownControl } from '../ui/DropdownControl';

export const dropdownNodeDef: ControlNodeDef<'dropdown'> = {
  type: 'dropdown',
  outputs: [{ name: 'value', type: 'string' }],
  evaluate(params) {
    return [{ kind: 'string', v: (params['value']?.v as string) ?? '' }];
  },
  renderControl(node, set) {
    const options = node.params.options?.v ?? [];
    return (
      <DropdownControl
        id={node.id}
        label={node.params.label?.v ?? ''}

        //@ts-expect-error - ignoreing this for now
        options={options}
        //@ts-expect-error - ignoreing this for now
        initialValue={node.params.value?.v ?? options[0] ?? ''}
        onChange={v => set('value', { kind: 'string', v })}
      />
    );
  },
};
