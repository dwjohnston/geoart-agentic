import { useState } from 'react';

type Props = {
  id: string;
  label: string;
  options: string[];
  initialValue: string;
  onChange: (value: string) => void;
};

export function DropdownControl({ id, label, options, initialValue, onChange }: Props) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="dropdown-control">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={e => {
          const v = e.target.value;
          setValue(v);
          onChange(v);
        }}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
