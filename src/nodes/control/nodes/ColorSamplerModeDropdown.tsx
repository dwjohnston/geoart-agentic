import { implementControlNode } from '../implementControlNode';
import { DropdownControl } from '../ui/DropdownControl';

const COLOR_SAMPLER_MODES = ['clobber'] as const;

export default implementControlNode('colorSamplerModeSelector', {
  defaults: {
    label: '',
    mode: 'clobber',
  },
  renderControl(node, set) {
    return (
      <DropdownControl
        id={node.id}
        label={node.params.label.v}
        options={COLOR_SAMPLER_MODES}
        initialValue={node.params.mode.v}
        onChange={v => set('mode', { v })}
      />
    );
  },
});
