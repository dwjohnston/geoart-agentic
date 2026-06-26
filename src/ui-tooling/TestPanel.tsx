import type { ReactNode, CSSProperties } from 'react';

type Props = {
  children: ReactNode;
  width?: string | number;
  height?: string | number;
  center?: boolean;
};

export function TestPanel({ children, width, height, center = false }: Props) {
  const styles: CSSProperties = {
    borderImage: 'repeating-linear-gradient(45deg, red 0px, red 10px, black 10px, black 20px) 1',
    borderWidth: '4px',
    borderStyle: 'solid',
    padding: '8px',
  };

  if (width !== undefined) {
    styles.width = typeof width === 'number' ? `${width}px` : width;
  }

  if (height !== undefined) {
    styles.height = typeof height === 'number' ? `${height}px` : height;
  }

  if (center) {
    styles.margin = '0 auto';
  }

  return <div style={styles}>{children}</div>;
}
