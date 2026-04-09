import { afterEach, describe, expect, test, vi } from 'vitest';
import { render, cleanup, within, fireEvent } from '@testing-library/react';
import { SliderControl } from './SliderControl';
import type { ControlNode } from '../../schema/_generated/schema-types';

type SliderNode = Extract<ControlNode, { type: 'slider' }>;

afterEach(cleanup);

const baseNode: SliderNode = {
  id: 'speed',
  type: 'slider',
  params: {
    label: { v: 'Speed' },
    min:   { v: 0 },
    max:   { v: 10 },
    value: { v: 3 },
  },
};

describe('SliderControl', () => {
  test('renders label and current value', () => {
    const { container } = render(<SliderControl node={baseNode} onChange={() => {}} />);
    expect(within(container).getByText('Speed')).toBeDefined();
    expect(within(container).getByRole('slider')).toBeDefined();
  });

  test('calls onChange with new value when dragged', () => {
    const onChange = vi.fn();
    const { container } = render(<SliderControl node={baseNode} onChange={onChange} />);

    const slider = within(container).getByRole('slider') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '5' } });

    expect(onChange).toHaveBeenCalledWith('speed', expect.any(Number));
  });

  test('falls back to defaults when params are absent', () => {
    const node: SliderNode = { id: 'x', type: 'slider', params: {} };
    const { container } = render(<SliderControl node={node} onChange={() => {}} />);
    const slider = within(container).getByRole('slider') as HTMLInputElement;
    expect(Number(slider.min)).toBe(0);
    expect(Number(slider.max)).toBe(1);
    expect(Number(slider.value)).toBe(0);
  });
});
