import type { ReactNode, CSSProperties } from 'react';
import './Grid.css';

type GridColSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type Props = {
  children: ReactNode;
  container?: boolean;
  gap?: number;
  xs?: GridColSize;
  lg?: GridColSize;
  xl?: GridColSize;
};

export function Grid({ 
  children, 
  container = false, 
  gap = 0, 
  xs = 12, 
  lg, 
  xl 
}: Props) {
  const styles: CSSProperties = {};

  // Container properties
  if (container) {
    styles.gap = `${gap}px`;
  }

  // Build data attributes for responsive breakpoints
  const dataAttrs: Record<string, string> = {};
  dataAttrs['data-grid-xs'] = xs.toString();
  if (lg) dataAttrs['data-grid-lg'] = lg.toString();
  if (xl) dataAttrs['data-grid-xl'] = xl.toString();

  return (
    <div
      style={styles}
      className="grid"
      {...dataAttrs}
      data-grid-container={container ? 'true' : 'false'}
    >
      {children}
    </div>
  );
}
