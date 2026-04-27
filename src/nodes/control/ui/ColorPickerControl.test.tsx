import { afterEach, describe, expect, test, vi } from 'vitest';
import { render, cleanup, within, fireEvent } from '@testing-library/react';
import { ColorPickerControl } from './ColorPickerControl';

afterEach(cleanup);

const baseProps = {
  id: 'trailColor',
  label: 'Trail Colour',
  initialValue: { r: 1, g: 0, b: 0.5, a: 1 },
};

describe('ColorPickerControl', () => {
  test('renders label', () => {
    const { container } = render(<ColorPickerControl {...baseProps} onChange={() => {}} />);
    expect(within(container).getByText('Trail Colour')).toBeDefined();
  });

  test('renders colour input with correct hex value', () => {
    const { container } = render(<ColorPickerControl {...baseProps} onChange={() => {}} />);
    const input = container.querySelector('input[type="color"]') as HTMLInputElement;
    expect(input.value).toBe('#ff0080');
  });

  test('calls onChange with parsed colour value when changed', () => {
    const onChange = vi.fn();
    const { container } = render(<ColorPickerControl {...baseProps} onChange={onChange} />);
    const input = container.querySelector('input[type="color"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '#0000ff' } });
    expect(onChange).toHaveBeenCalledWith({ r: 0, g: 0, b: 1, a: 1 });
  });

  test('preserves alpha when colour changes', () => {
    const onChange = vi.fn();
    const { container } = render(
      <ColorPickerControl
        id="x"
        label=""
        initialValue={{ r: 1, g: 0, b: 0, a: 0.5 }}
        onChange={onChange}
      />
    );
    const input = container.querySelector('input[type="color"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '#ffffff' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ a: 0.5 }));
  });

  test('falls back to white when initialValue is default', () => {
    const { container } = render(
      <ColorPickerControl id="x" label="" initialValue={{ r: 1, g: 1, b: 1, a: 1 }} onChange={() => {}} />
    );
    const input = container.querySelector('input[type="color"]') as HTMLInputElement;
    expect(input.value).toBe('#ffffff');
  });
});
