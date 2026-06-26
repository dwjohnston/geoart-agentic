import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { describe, it, expect } from 'vitest';
import { ModulePanel } from './ModulePanel';
import { TestPanel } from '../ui-tooling/TestPanel';
import { KnobControl } from './KnobControl';
import { DropdownControl } from '../nodes/control/ui/DropdownControl';

describe('ModulePanel component', () => {

  it('renders with knob controls and dropdown controls', async () => {
    await render(
      <TestPanel center>
        <ModulePanel moduleName="Controls Module" moduleId="test-module-001">
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

    const knobs = page.getByRole('slider');
    expect(knobs.length).toBe(2);

    const dropdown = page.getByRole('combobox');
    expect(dropdown).toBeInTheDocument();
  });

});
