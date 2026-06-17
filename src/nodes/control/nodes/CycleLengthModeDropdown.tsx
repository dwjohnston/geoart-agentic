import { implementControlNode } from '../implementControlNode';
import { DropdownControl } from '../ui/DropdownControl';

const CYCLE_LENGTH_MODES = ['arrayLength', 'linearOne', 'linearTotal'] as const;

export default implementControlNode('cycleLengthModeSelector', {
  defaults: {
    label: '',
    value: 'arrayLength',
  },
  renderControl(node, set) {
    return (
      <DropdownControl
        id={node.id}
        label={node.params.label.v}
        options={CYCLE_LENGTH_MODES}
        initialValue={node.params.value.v}
        onChange={v => set('value', { v })}
      />
    );
  },
});
