import { defineControlNode } from '../types';
import { DropdownControl } from '../ui/DropdownControl';

export const dropdownNodeDef = defineControlNode('dropdown', {
  defaults: {
    label: { v: '' },
    options: { v: [] },
    value: { v: '' },
  },
  renderControl(node, set) {
    return (
      <DropdownControl
        id={node.id}
        label={node.params.label.v}
        options={node.params.options.v.map((v) => v.v)}
        initialValue={node.params.value.v}
        onChange={v => set('value', { v })}
      />
    );
  },
});
