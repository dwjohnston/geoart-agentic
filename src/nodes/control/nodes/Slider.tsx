import { implementControlNode } from '../implementControlNode';
import { SliderControl } from '../ui/SliderControl';

const sliderNodeImplementation = implementControlNode('slider', {
  defaults: {
    label: '',
    min: 0,
    max: 1,
    value: 0,
    step: 0.01,
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

export default sliderNodeImplementation;
