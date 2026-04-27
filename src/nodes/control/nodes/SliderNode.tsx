import type { ControlNodeDef } from '../types';
import type { ControlNode } from '../../../schema/_generated/schema-types';
import { SliderControl } from '../ui/SliderControl';

type SliderNode = Extract<ControlNode, { type: 'slider' }>;

export const sliderNodeDef: ControlNodeDef = {
  type: 'slider',
  outputs: [{ name: 'value', type: 'number' }],
  params: {
    label: { type: 'string' },
    min:   { type: 'number' },
    max:   { type: 'number' },
    step:  { type: 'number' },
    value: { type: 'number' },
  },
  evaluate(params) {
    return [{ kind: 'number', v: (params['value']?.v as number) ?? 0 }];
  },
  renderControl(node, set) {
    const n = node as SliderNode;
    return (
      <SliderControl
        id={n.id}
        label={n.params.label?.v ?? ''}
        min={n.params.min?.v ?? 0}
        max={n.params.max?.v ?? 1}
        step={n.params.step?.v ?? 0.01}
        initialValue={n.params.value?.v ?? 0}
        onChange={v => set('value', { kind: 'number', v })}
      />
    );
  },
};
