import { defineControlNode } from '../types';
import { SliderControl } from '../ui/SliderControl';

export const sliderNodeDef = defineControlNode('slider', {
  defaults: {
    label: { v: '' },
    min: { v: 0 },
    max: { v: 1 },
    value: { v: 0 },
    step: { v: 0.01 },
  },
  renderControl(node, set) {
    return (
      <SliderControl
        id={node.id}
        label={node.params.label.v}
        min={node.params.min.v}
        max={node.params.max.v}
        step={node.params.step.v}
        initialValue={node.params.value.v}
        onChange={v => set('value', { v })}
      />
    );
  },
});
