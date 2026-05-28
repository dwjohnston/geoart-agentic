import { useState } from 'react';

type Props = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  initialValue: number;
  onChange: (value: number) => void;
};

function decimalPlacesForStep(step: number): number {
  const str = step.toString();
  const dot = str.indexOf('.');
  return dot === -1 ? 0 : str.length - dot - 1;
}

export function SliderControl({ id, label, min, max, step, initialValue, onChange }: Props) {
  const [value, setValue] = useState(initialValue);
  const decimals = decimalPlacesForStep(step);

  return (
    <div className="slider-control">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="range"
        data-testid={`${id}-slider`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => {
          const v = e.target.valueAsNumber;
          setValue(v);
          onChange(v);
        }}
      />
      <output htmlFor={id} data-testid={`${id}-output`}>{value.toFixed(decimals)}</output>
    </div>
  );
}
