import type { ReactNode } from 'react';
import { Grid } from './Grid';

type Props = {
  children: ReactNode;
  gap?: number;
};

export function ModulePanel({ children, gap = 16 }: Props) {
  return (
    <Grid container gap={gap} xs={12}>
      {children}
    </Grid>
  );
}
