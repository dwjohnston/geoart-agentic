import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ModulePanel } from './ModulePanel';
import { TestPanel } from '../ui-tooling/TestPanel';
import { KnobControl } from './KnobControl';
import { DropdownControl } from '../nodes/control/ui/DropdownControl';

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

  it('renders with a title when provided', () => {
    const { container } = render(
      <TestPanel center>
        <ModulePanel title="Test Module">
          <div>Content</div>
        </ModulePanel>
      </TestPanel>
    );

    const title = container.querySelector('h2');
    expect(title?.textContent).toBe('Test Module');
  });

  it('applies light grey background and box shadow styling', () => {
    const { container } = render(
      <TestPanel center>
        <ModulePanel title="Styled Module">
          <div>Content</div>
        </ModulePanel>
      </TestPanel>
    );

    const wrapper = container.querySelector('[style*="backgroundColor"]');
    expect(wrapper?.getAttribute('style')).toContain('e8e8e8');
    expect(wrapper?.getAttribute('style')).toContain('boxShadow');
  });

  it('renders with knob controls and dropdown controls', () => {
    const { container } = render(
      <TestPanel center>
        <ModulePanel title="Controls Module">
          <KnobControl
            initialValue={50}
            min={0}
            max={100}
            label="Volume"
            onChange={(value) => console.log('Volume:', value)}
          />
          <KnobControl
            initialValue={1}
            min={0.1}
            max={10}
            scale="log"
            label="Frequency"
            onChange={(value) => console.log('Frequency:', value)}
          />
          <DropdownControl
            id="wave-type"
            label="Wave Type"
            options={['sine', 'square', 'sawtooth', 'triangle'] as const}
            initialValue="sine"
            onChange={(value) => console.log('Wave:', value)}
          />
        </ModulePanel>
      </TestPanel>
    );

    const knobs = container.querySelectorAll('.knob-control');
    expect(knobs.length).toBe(2);

    const dropdown = container.querySelector('select');
    expect(dropdown).toBeInTheDocument();
  });

});
