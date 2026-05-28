import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { fireEvent } from '@testing-library/dom';
import { ColorPickerControl } from './ColorPickerControl';

const baseProps = {
  id: 'trailColor',
  label: 'Trail Colour',
  initialValue: { r: 1, g: 0, b: 0.5, a: 1 },
};

describe('ColorPickerControl', () => {
  test('renders label', async () => {
    const { container } = await render(<ColorPickerControl {...baseProps} onChange={() => { }} />);
    expect(container.textContent).toContain('Trail Colour');
  });

  test('renders colour input with correct hex value', async () => {
    const { container } = await render(<ColorPickerControl {...baseProps} onChange={() => { }} />);
    const input = container.querySelector('input[type="color"]') as HTMLInputElement;
    expect(input.value).toBe('#ff0080');
  });

  test('calls onChange with parsed colour value when changed', async () => {
    const onChange = vi.fn();
    const { container } = await render(<ColorPickerControl {...baseProps} onChange={onChange} />);
    const input = container.querySelector('input[type="color"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '#0000ff' } });
    expect(onChange).toHaveBeenCalledWith({ r: 0, g: 0, b: 1, a: 1 });
  });

  test('preserves alpha when colour changes', async () => {
    const onChange = vi.fn();
    const { container } = await render(
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

  test('calls onChange with updated alpha when opacity slider changes', async () => {
    const onChange = vi.fn();
    const { container } = await render(<ColorPickerControl {...baseProps} onChange={onChange} />);
    const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '0.25' } });
    expect(onChange).toHaveBeenCalledWith({ r: 1, g: 0, b: 0.5, a: 0.25 });
  });

  test('falls back to white when initialValue is default', async () => {
    const { container } = await render(
      <ColorPickerControl id="x" label="" initialValue={{ r: 1, g: 1, b: 1, a: 1 }} onChange={() => { }} />
    );
    const input = container.querySelector('input[type="color"]') as HTMLInputElement;
    expect(input.value).toBe('#ffffff');
  });
});
