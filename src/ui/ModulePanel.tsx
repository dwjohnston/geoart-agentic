import type { ReactNode } from 'react';
import { Grid } from './Grid';

type Props = {
  children: ReactNode;
  gap?: number;
  moduleName?: string;
  moduleId?: string;
};

export function ModulePanel({ children, gap = 16, moduleName, moduleId }: Props) {
  const hasHeader = moduleName || moduleId;
  return (
    <div
      style={{
        backgroundColor: '#3A3A3A',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: hasHeader ? '12px' : '0',
        borderRadius: '4px',
      }}
    >
      {hasHeader && (
        <div style={{
          marginBottom: '12px',
        }}>
          {moduleName && (
            <h2 style={{
              margin: '0 0 4px 0',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#e8e8e8',
            }}>
              {moduleName}
            </h2>
          )}
          {moduleId && (
            <p style={{
              margin: '0',
              fontSize: '0.75rem',
              color: '#a8a8a8',
            }}>
              {moduleId}
            </p>
          )}
        </div>
      )}
      <Grid container gap={gap} xs={12}>
        {children}
      </Grid>
    </div>
  );
}
