import { useState, type ReactNode } from 'react';
import { Grid } from './Grid';

type Props = {
  children: ReactNode;
  gap?: number;
  moduleName?: string;
  moduleId?: string;
  "data-testid"?: string;
};

export function ModulePanel({ children, gap = 16, moduleName, moduleId, "data-testid": testId }: Props) {
  const hasHeader = moduleName || moduleId;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      data-testid={testId}
      style={{
        backgroundColor: '#3A3A3A',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: '12px',
        borderRadius: '4px',
      }}
    >
      {hasHeader && (
        <div
          style={{
            marginBottom: collapsed ? '0' : '12px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => setCollapsed(c => !c)}
        >
          <div>
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
          <span style={{ color: '#a8a8a8', fontSize: '0.75rem', marginLeft: '8px', lineHeight: '1.2rem' }}>
            {collapsed ? '▶' : '▼'}
          </span>
        </div>
      )}
      {!collapsed && (
        <Grid container gap={gap} xs={12}>
          {children}
        </Grid>
      )}
    </div>
  );
}
