import { useState } from 'react';

type Props = {
  min: number;
  max: number;
  step?: number;
  onChange: (value: { min: number; max: number }) => void;
};

export function SwingRangeControl({ min, max, step, onChange }: Props) {
  const [currentMin, setCurrentMin] = useState(min);
  const [currentMax, setCurrentMax] = useState(max);
  const [influence, setInfluence] = useState(1);

  function handleMinChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    setCurrentMin(value);
    setInfluence(1);
    onChange({ min: value, max: currentMax });
  }

  function handleMaxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    setCurrentMax(value);
    setInfluence(1);
    onChange({ min: currentMin, max: value });
  }

  function handleInfluenceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inf = Number(e.target.value);
    setInfluence(inf);
    const midpoint = (min + max) / 2;
    const newMin = midpoint + (min - midpoint) * inf;
    const newMax = midpoint + (max - midpoint) * inf;
    setCurrentMin(newMin);
    setCurrentMax(newMax);
    onChange({ min: newMin, max: newMax });
  }

  return (
    <div className="swing-range-control">
      <input
        type="number"
        data-testid="swing-min"
        value={currentMin}
        step={step}
        onChange={handleMinChange}
      />
      <input
        type="number"
        data-testid="swing-max"
        value={currentMax}
        step={step}
        onChange={handleMaxChange}
      />
      <input
        type="range"
        data-testid="swing-influence"
        min={0}
        max={1}
        step={0.01}
        value={influence}
        onChange={handleInfluenceChange}
      />
    </div>
  );
}
