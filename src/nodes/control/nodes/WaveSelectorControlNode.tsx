import { defineControlNode } from '../types';
import { DropdownControl } from '../ui/DropdownControl';

const WAVE_TYPES = ["sine", "square", "triangle", "saw", "reverse-saw"] as const

export const waveSelectorNodeDef = defineControlNode('waveSelector', {
  defaults: {
    label: { v: '' },
    value: { v: 'sine' },
  },
  renderControl(node, set) {
    return (
      <DropdownControl
        id={node.id}
        label={node.params.label.v}
        options={WAVE_TYPES}
        initialValue={node.params.value.v}
        onChange={v => set('value', { v })}
      />
    );
  },
});

