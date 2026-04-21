import { SliderControl } from '../nodes/control/ui/SliderControl';
import { ColorPickerControl } from '../nodes/control/ui/ColorPickerControl';
import type { ControlNode } from '../schema/_generated/schema-types';

export type SliderNode = Extract<ControlNode, { type: 'slider' }>;
export type ColorPickerNode = Extract<ControlNode, { type: 'colorPicker' }>;
export type ColorValue = { r: number; g: number; b: number; a: number };

type Props = {
  nodes: ControlNode[];
  onValueChange: (nodeId: string, value: number | ColorValue) => void;
};

export function Controls({ nodes, onValueChange }: Props) {
  return (
    <>
      {nodes.map(node => {
        if (node.type === 'slider') {
          return <SliderControl key={node.id} node={node} onChange={(id, v) => onValueChange(id, v)} />;
        }
        if (node.type === 'colorPicker') {
          return <ColorPickerControl key={node.id} node={node} onChange={(id, v) => onValueChange(id, v)} />;
        }
        return null;
      })}
    </>
  );
}
