import type { ControlNodeDef } from '../types';
import { ColorPickerControl } from '../ui/ColorPickerControl';

type ColorValue = { r: number; g: number; b: number; a: number };

export const colorPickerNodeDef: ControlNodeDef<'colorPicker'> = {
  type: 'colorPicker',
  outputs: [{ name: 'value', type: 'color' }],
  evaluate(params) {
    const v = params['value']?.v as ColorValue | undefined;
    return [{
      kind: 'color',
      v: v ?? { r: 1, g: 1, b: 1, a: 1 },
    }];
  },
  renderControl(node, set) {
    return (
      <ColorPickerControl
        id={node.id}
        label={node.params.label?.v ?? ''}
        initialValue={node.params.value?.v ?? { r: 1, g: 1, b: 1, a: 1 }}
        onChange={v => set('value', { kind: 'color', v })}
      />
    );
  },
};
