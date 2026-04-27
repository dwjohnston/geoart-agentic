import type { ControlNodeDef } from '../types';
import type { ControlNode } from '../../../schema/_generated/schema-types';
import { ColorPickerControl } from '../ui/ColorPickerControl';

type ColorPickerNode = Extract<ControlNode, { type: 'colorPicker' }>;
type ColorValue = { r: number; g: number; b: number; a: number };

export const colorPickerNodeDef: ControlNodeDef = {
  type: 'colorPicker',
  outputs: [{ name: 'value', type: 'color' }],
  params: {
    label: { type: 'string' },
    value: { type: 'color' },
  },
  evaluate(params) {
    const v = params['value']?.v as ColorValue | undefined;
    return [{
      kind: 'color',
      v: v ?? { r: 1, g: 1, b: 1, a: 1 },
    }];
  },
  renderControl(node, set) {
    const n = node as ColorPickerNode;
    return (
      <ColorPickerControl
        id={n.id}
        label={n.params.label?.v ?? ''}
        initialValue={n.params.value?.v ?? { r: 1, g: 1, b: 1, a: 1 }}
        onChange={v => set('value', { kind: 'color', v })}
      />
    );
  },
};
