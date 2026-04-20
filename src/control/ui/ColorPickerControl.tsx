import type { ControlNode } from '../../schema/_generated/schema-types';

type ColorPickerNode = Extract<ControlNode, { type: 'colorPicker' }>;

type ColorValue = { r: number; g: number; b: number; a: number };

type Props = {
  node: ColorPickerNode;
  onChange: (nodeId: string, value: ColorValue) => void;
};

function toHex(value: ColorValue): string {
  const r = Math.round(value.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(value.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(value.b * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function fromHex(hex: string, alpha: number): ColorValue {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b, a: alpha };
}

export function ColorPickerControl({ node, onChange }: Props) {
  const { params } = node;
  const label = params.label?.v ?? '';
  const value = params.value?.v ?? { r: 1, g: 1, b: 1, a: 1 };

  const hex = toHex(value);

  return (
    <div className="color-picker-control">
      <label htmlFor={node.id}>{label}</label>
      <input
        id={node.id}
        type="color"
        value={hex}
        onChange={e => onChange(node.id, fromHex(e.target.value, value.a))}
      />
    </div>
  );
}
