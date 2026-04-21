import { SliderControl } from '../nodes/control/ui/SliderControl';
import { ColorPickerControl } from '../nodes/control/ui/ColorPickerControl';
import type { ControlRegistration } from './GraphEngine';

type Props = {
  registrations: ControlRegistration[];
};

export function Controls({ registrations }: Props) {
  return (
    <>
      {registrations.map(reg => {
        if (reg.type === 'slider') {
          return <SliderControl key={reg.node.id} node={reg.node} onChange={(_, v) => reg.setValue(v)} />;
        }
        if (reg.type === 'colorPicker') {
          return <ColorPickerControl key={reg.node.id} node={reg.node} onChange={(_, v) => reg.setValue(v)} />;
        }
        return null;
      })}
    </>
  );
}
