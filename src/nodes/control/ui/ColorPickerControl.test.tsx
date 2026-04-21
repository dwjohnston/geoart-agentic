import { afterEach, describe, expect, test, vi } from 'vitest';
import { render, cleanup, within, fireEvent } from '@testing-library/react';
import { ColorPickerControl } from './ColorPickerControl';
import type { ControlNode } from '../../../schema/_generated/schema-types';

type ColorPickerNode = Extract<ControlNode, { type: 'colorPicker' }>;

afterEach(cleanup);

const baseNode: ColorPickerNode = {
  id: 'trailColor',
  type: 'colorPicker',
  params: {
    label: { v: 'Trail Colour' },
    value: { v: { r: 1, g: 0, b: 0.5, a: 1 } },
  },
};

describe('ColorPickerControl', () => {
  test('renders label', () => {
    const { container } = render(<ColorPickerControl node={baseNode} onChange={() => {}} />);
    expect(within(container).getByText('Trail Colour')).toBeDefined();
  });

  test('renders colour input with correct hex value', () => {
    const { container } = render(<ColorPickerControl node={baseNode} onChange={() => {}} />);
    const input = container.querySelector('input[type="color"]') as HTMLInputElement;
    expect(input.value).toBe('#ff0080');
  });

  test('calls onChange with parsed colour value when changed', () => {
    const onChange = vi.fn();
    const { container } = render(<ColorPickerControl node={baseNode} onChange={onChange} />);
    const input = container.querySelector('input[type="color"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '#0000ff' } });
    expect(onChange).toHaveBeenCalledWith('trailColor', { r: 0, g: 0, b: 1, a: 1 });
  });

  test('preserves alpha when colour changes', () => {
    const node: ColorPickerNode = {
      ...baseNode,
      params: { ...baseNode.params, value: { v: { r: 1, g: 0, b: 0, a: 0.5 } } },
    };
    const onChange = vi.fn();
    const { container } = render(<ColorPickerControl node={node} onChange={onChange} />);
    const input = container.querySelector('input[type="color"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '#ffffff' } });
    expect(onChange).toHaveBeenCalledWith('trailColor', expect.objectContaining({ a: 0.5 }));
  });

  test('falls back to white when params are absent', () => {
    const node: ColorPickerNode = { id: 'x', type: 'colorPicker', params: {} };
    const { container } = render(<ColorPickerControl node={node} onChange={() => {}} />);
    const input = container.querySelector('input[type="color"]') as HTMLInputElement;
    expect(input.value).toBe('#ffffff');
  });
});
