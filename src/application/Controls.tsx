import type React from 'react';

type Props = {
  renderControlNodes: () => React.ReactNode;
};

export function Controls({ renderControlNodes }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      {renderControlNodes()}
    </div>
  );
}
