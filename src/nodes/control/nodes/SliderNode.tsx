import type { ControlNodeDef } from '../types';
import { SliderControl } from '../ui/SliderControl';

export const sliderNodeDef: ControlNodeDef<'slider'> = {
  type: 'slider',
  outputs: [{ name: 'value', type: 'number' }],
  evaluate(params) {
    return [{ kind: 'number', v: (params['value']?.v as number) ?? 0 }];
  },
  renderControl(node, set) {
    return (
      <SliderControl
        id={node.id}
        label={node.params.label?.v ?? ''}
        min={node.params.min?.v ?? 0}
        max={node.params.max?.v ?? 1}
        step={node.params.step?.v ?? 0.01}
        initialValue={node.params.value?.v ?? 0}
        onChange={v => set('value', { kind: 'number', v })}
      />
    );
  },
};
