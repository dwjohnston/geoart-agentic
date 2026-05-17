import { implementControlNode } from '../implementControlNode';
import { DropdownControl } from '../ui/DropdownControl';

const TIMED_LINE_ARRAY_MODES = ['all-to-all', 'distribute', 'interleave'] as const;

export default implementControlNode('timedLineArrayModeSelector', {
  defaults: {
    label: '',
    value: 'all-to-all',
  },
  renderControl(node, set) {
    return (
      <DropdownControl
        id={node.id}
        label={node.params.label.v}
        options={TIMED_LINE_ARRAY_MODES}
        initialValue={node.params.value.v}
        onChange={v => set('value', { v })}
      />
    );
  },
});
