import { useState } from 'react';
import type { ControlNode } from '../../../schema/_generated/schema-types';

type DropdownNode = Extract<ControlNode, { type: 'dropdown' }>;

type Props = {
  node: DropdownNode;
  onChange: (nodeId: string, value: string) => void;
};

export function DropdownControl({ node, onChange }: Props) {
  const { params } = node;
  const label = params.label?.v ?? '';
  const options = params.options?.v ?? [];
  const [value, setValue] = useState(params.value?.v ?? options[0] ?? '');

  return (
    <div className="dropdown-control">
      <label htmlFor={node.id}>{label}</label>
      <select
        id={node.id}
        value={value}
        onChange={e => {
          const v = e.target.value;
          setValue(v);
          onChange(node.id, v);
        }}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
