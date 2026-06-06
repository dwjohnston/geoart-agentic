import { implementControlNode } from '../implementControlNode';
import { DropdownControl } from '../ui/DropdownControl';

const NORMALISE_MODES = ['product', 'sequential'] as const;

export default implementControlNode('normaliseModeSelector', {
  defaults: {
    label: '',
    value: 'product',
  },
  renderControl(node, set) {
    return (
      <DropdownControl
        id={node.id}
        label={node.params.label.v}
        options={NORMALISE_MODES}
        initialValue={node.params.value.v}
        onChange={v => set('value', { v })}
      />
    );
  },
});
