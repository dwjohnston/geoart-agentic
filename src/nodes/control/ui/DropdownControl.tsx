import { useState } from 'react';

type Props<T extends string> = {
  id: string;
  label: string;
  options: readonly T[];
  initialValue: T;
  onChange: (value: T) => void;
};

export function DropdownControl<T extends string>({ id, label, options, initialValue, onChange }: Props<T>) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="dropdown-control">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={e => {
          const v = e.target.value as T;
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
