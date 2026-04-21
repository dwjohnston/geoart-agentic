import type { ControlNode } from '../../schema/_generated/schema-types';

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
  const value = params.value?.v ?? 0;


  const decimals = decimalPlacesForStep(step);
  const displayValue = value.toFixed(decimals);

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
        onChange={e => onChange(node.id, e.target.valueAsNumber)}
      />
      <output htmlFor={node.id}>{displayValue}</output>
    </div>
  );
}
