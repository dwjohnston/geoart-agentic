import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ModulePanel } from './ModulePanel';
import { TestPanel } from '../ui-tooling/TestPanel';

describe('ModulePanel component', () => {
  it('renders as a grid container spanning full width', () => {
    const { container } = render(
      <TestPanel center>
        <ModulePanel>
          <div>Item 1</div>
          <div>Item 2</div>
        </ModulePanel>
      </TestPanel>
    );
    
    const grid = container.querySelector('.grid');
    expect(grid?.getAttribute('data-grid-container')).toBe('true');
    expect(grid?.getAttribute('data-grid-xs')).toBe('12');
  });

  it('applies default gap of 16px', () => {
    const { container } = render(
      <TestPanel center>
        <ModulePanel>
          <div>Item</div>
        </ModulePanel>
      </TestPanel>
    );
    
    const grid = container.querySelector('.grid');
    expect(grid).toHaveStyle({ gap: '16px' });
  });

  it('allows custom gap', () => {
    const { container } = render(
      <TestPanel center>
        <ModulePanel gap={32}>
          <div>Item</div>
        </ModulePanel>
      </TestPanel>
    );
    
    const grid = container.querySelector('.grid');
    expect(grid).toHaveStyle({ gap: '32px' });
  });

  it('renders children correctly', () => {
    const { container } = render(
      <TestPanel center>
        <ModulePanel>
          <div>Panel Item 1</div>
          <div>Panel Item 2</div>
        </ModulePanel>
      </TestPanel>
    );
    
    const gridContainer = container.querySelector('[data-grid-container="true"]');
    expect(gridContainer).toBeInTheDocument();
  });
});
