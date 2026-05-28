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
    <div
      className="dropdown-control"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none', gap: 4 }}
    >
      <select
        id={id}
        value={value}
        onChange={e => {
          const v = e.target.value as T;
          setValue(v);
          onChange(v);
        }}
        style={{ width: 80 }}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <label htmlFor={id} style={{ fontSize: '0.75rem', color: '#aaa' }}>
        {label}
      </label>
    </div>
  );
}
