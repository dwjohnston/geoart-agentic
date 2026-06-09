import type { ReactNode } from 'react';
import { Grid } from './Grid';

type Props = {
  children: ReactNode;
  gap?: number;
  title?: string;
};

export function ModulePanel({ children, gap = 16, title }: Props) {
  return (
    <div
      style={{
        backgroundColor: '#e8e8e8',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: title ? '12px' : '0',
        borderRadius: '4px',
      }}
    >
      {title && (
        <h2 style={{
          margin: '0 0 12px 0',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#333',
        }}>
          {title}
        </h2>
      )}
      <Grid container gap={gap} xs={12}>
        {children}
      </Grid>
    </div>
  );
}
