import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ModulePanel } from './ModulePanel';
import { TestPanel } from '../ui-tooling/TestPanel';
import { KnobControl } from './KnobControl';
import { DropdownControl } from '../nodes/control/ui/DropdownControl';

describe('ModulePanel component', () => {

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
