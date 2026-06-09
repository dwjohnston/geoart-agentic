import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Grid } from './Grid';
import { ModulePanel } from './ModulePanel';

describe('Grid component', () => {
  it('renders grid container with correct classes', () => {
    const { container } = render(
      <Grid container gap={16}>
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>
    );
    
    const grid = container.querySelector('.grid');
    expect(grid).not.toBeNull();
    expect(grid?.getAttribute('data-grid-container')).toBe('true');
  });

  it('applies gap property to container', () => {
    const { container } = render(
      <Grid container gap={24}>
        <div>Item</div>
      </Grid>
    );
    
    const grid = container.querySelector('.grid');
    expect(grid).toHaveStyle({ gap: '24px' });
  });

  it('sets default xs column span to 12', () => {
    const { container } = render(
      <Grid>
        <div>Item</div>
      </Grid>
    );
    
    const grid = container.querySelector('.grid');
    expect(grid?.getAttribute('data-grid-xs')).toBe('12');
  });

  it('sets responsive breakpoints correctly', () => {
    const { container } = render(
      <Grid xs={6} lg={4} xl={3}>
        <div>Item</div>
      </Grid>
    );
    
    const grid = container.querySelector('.grid');
    expect(grid?.getAttribute('data-grid-xs')).toBe('6');
    expect(grid?.getAttribute('data-grid-lg')).toBe('4');
    expect(grid?.getAttribute('data-grid-xl')).toBe('3');
  });

  it('renders children correctly', () => {
    const { container } = render(
      <Grid container>
        <Grid xs={6}>Item 1</Grid>
        <Grid xs={6}>Item 2</Grid>
      </Grid>
    );
    
    const gridContainer = container.querySelector('[data-grid-container="true"]');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer?.querySelector('[data-grid-xs="6"]')).toBeInTheDocument();
  });
});

describe('ModulePanel component', () => {
  it('renders as a grid container spanning full width', () => {
    const { container } = render(
      <ModulePanel>
        <div>Item 1</div>
        <div>Item 2</div>
      </ModulePanel>
    );
    
    const grid = container.querySelector('.grid');
    expect(grid?.getAttribute('data-grid-container')).toBe('true');
    expect(grid?.getAttribute('data-grid-xs')).toBe('12');
  });

  it('applies default gap of 16px', () => {
    const { container } = render(
      <ModulePanel>
        <div>Item</div>
      </ModulePanel>
    );
    
    const grid = container.querySelector('.grid');
    expect(grid).toHaveStyle({ gap: '16px' });
  });

  it('allows custom gap', () => {
    const { container } = render(
      <ModulePanel gap={32}>
        <div>Item</div>
      </ModulePanel>
    );
    
    const grid = container.querySelector('.grid');
    expect(grid).toHaveStyle({ gap: '32px' });
  });

  it('renders children correctly', () => {
    render(
      <ModulePanel>
        <div>Panel Item 1</div>
        <div>Panel Item 2</div>
      </ModulePanel>
    );
    
    expect(screen.getByText('Panel Item 1')).toBeInTheDocument();
    expect(screen.getByText('Panel Item 2')).toBeInTheDocument();
  });
});
