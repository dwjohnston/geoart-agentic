import { useState } from 'react';

type ColorValue = { r: number; g: number; b: number; a: number };

type Props = {
  id: string;
  label: string;
  initialValue: ColorValue;
  onChange: (value: ColorValue) => void;
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

export function ColorPickerControl({ id, label, initialValue, onChange }: Props) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="color-picker-control">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="color"
        value={toHex(value)}
        onChange={e => {
          const v = fromHex(e.target.value, value.a);
          setValue(v);
          onChange(v);
        }}
      />
    </div>
  );
}
