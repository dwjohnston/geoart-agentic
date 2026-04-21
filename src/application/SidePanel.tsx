import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function SidePanel({ children }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        minWidth: 220,
        padding: 16,
        background: '#111118',
        borderRadius: 8,
        color: '#ccc',
      }}
    >
      {children}
    </div>
  );
}
