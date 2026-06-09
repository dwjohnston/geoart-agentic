import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Grid } from './Grid';
import { TestPanel } from '../ui-tooling/TestPanel';

describe('Grid component', () => {
  it('renders grid container with correct classes', () => {
    const { container } = render(
      <TestPanel>
        <Grid container gap={16}>
          <div>Item 1</div>
          <div>Item 2</div>
        </Grid>
      </TestPanel>
    );
    
    const grid = container.querySelector('.grid');
    expect(grid).not.toBeNull();
    expect(grid?.getAttribute('data-grid-container')).toBe('true');
  });

  it('applies gap property to container', () => {
    const { container } = render(
      <TestPanel>
        <Grid container gap={24}>
          <div>Item</div>
        </Grid>
      </TestPanel>
    );
    
    const grid = container.querySelector('.grid');
    expect(grid).toHaveStyle({ gap: '24px' });
  });

  it('sets default xs column span to 12', () => {
    const { container } = render(
      <TestPanel>
        <Grid>
          <div>Item</div>
        </Grid>
      </TestPanel>
    );
    
    const grid = container.querySelector('.grid');
    expect(grid?.getAttribute('data-grid-xs')).toBe('12');
  });

  it('sets responsive breakpoints correctly', () => {
    const { container } = render(
      <TestPanel>
        <Grid container>
          <Grid xs={6} lg={4} xl={3}>
            <div>Item</div>
          </Grid>
        </Grid>
      </TestPanel>
    );
    
    const grid = container.querySelector('[data-grid-xs="6"]');
    expect(grid?.getAttribute('data-grid-xs')).toBe('6');
    expect(grid?.getAttribute('data-grid-lg')).toBe('4');
    expect(grid?.getAttribute('data-grid-xl')).toBe('3');
  });

  it('renders children correctly', () => {
    const { container } = render(
      <TestPanel>
        <Grid container gap={16}>
          <Grid xs={6}>
            <div>Item 1</div>
          </Grid>
          <Grid xs={6}>
            <div>Item 2</div>
          </Grid>
        </Grid>
      </TestPanel>
    );
    
    const gridContainer = container.querySelector('[data-grid-container="true"]');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer?.querySelector('[data-grid-xs="6"]')).toBeInTheDocument();
  });
});
