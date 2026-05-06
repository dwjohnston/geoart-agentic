import { implementControlNode } from '../implementControlNode';
import { ColorPickerControl } from '../ui/ColorPickerControl';

export const colorPickerNodeDef = implementControlNode('colorPicker', {
  defaults: {
    label: '',
    value: { r: 1, g: 1, b: 1, a: 1 },
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
