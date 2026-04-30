import { defineControlNode } from '../types';
import { ColorPickerControl } from '../ui/ColorPickerControl';

export const colorPickerNodeDef = defineControlNode('colorPicker', {
  defaults: {
    label: { v: '' },
    value: { v: { r: 1, g: 1, b: 1, a: 1 } },
  },
  renderControl(node, set) {
    return (
      <ColorPickerControl
        id={node.id}
        label={node.params.label.v}
        initialValue={node.params.value.v}
        onChange={v => set('value', { v })}
      />
    );
  },
});
