import { useState } from 'react';
import type { ControlNode } from '../../../schema/_generated/schema-types';

type SliderNode = Extract<ControlNode, { type: 'slider' }>;

type Props = {
  node: SliderNode;
  onChange: (nodeId: string, value: number) => void;
};

function decimalPlacesForStep(step: number): number {
  const str = step.toString();
  const dot = str.indexOf('.');
  return dot === -1 ? 0 : str.length - dot - 1;
}

export function SliderControl({ node, onChange }: Props) {
  const { params } = node;
  const label = params.label?.v ?? '';
  const min = params.min?.v ?? 0;
  const max = params.max?.v ?? 1;
  const step = params.step?.v ?? 1;
  const [value, setValue] = useState(params.value?.v ?? 0);

  const decimals = decimalPlacesForStep(step);

  return (
    <div className="slider-control">
      <label htmlFor={node.id}>{label}</label>
      <input
        id={node.id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => {
          const v = e.target.valueAsNumber;
          setValue(v);
          onChange(node.id, v);
        }}
      />
      <output htmlFor={node.id}>{value.toFixed(decimals)}</output>
    </div>
  );
}
