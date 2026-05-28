import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { ColorPickerControl } from './ColorPickerControl';

const baseProps = {
  id: 'trailColor',
  label: 'Trail Colour',
  initialValue: { r: 1, g: 0, b: 0.5, a: 1 },
};

describe('ColorPickerControl', () => {
  test('renders label', async () => {
    await render(<ColorPickerControl {...baseProps} onChange={() => { }} />);
    const label = page.getByText('Trail Colour');
    expect(label).toBeInTheDocument();
  });

  test('renders colour input with correct hex value', async () => {
    await render(<ColorPickerControl {...baseProps} onChange={() => { }} />);
    const input = page.getByTestId('trailColor-color')
    expect((input.element() as HTMLInputElement).value).toBe('#ff0080');
  });

  test('calls onChange with parsed colour value when changed', async () => {
    const onChange = vi.fn();
    await render(<ColorPickerControl {...baseProps} onChange={onChange} />);
    const input = page.getByTestId('trailColor-color');
    await input.fill('#0000ff');
    await vi.waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({ r: 0, g: 0, b: 1, a: 1 });
    });
  });

  test('preserves alpha when colour changes', async () => {
    const onChange = vi.fn();
    await render(
      <ColorPickerControl
        id="x"
        label=""
        initialValue={{ r: 1, g: 0, b: 0, a: 0.5 }}
        onChange={onChange}
      />
    );
    const input = page.getByTestId('x-color');
    await input.fill('#ffffff');
    await vi.waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ a: 0.5 }));
    });
  });

  test('calls onChange with updated alpha when opacity slider changes', async () => {
    const onChange = vi.fn();
    await render(<ColorPickerControl {...baseProps} onChange={onChange} />);
    const slider = page.getByTestId('trailColor-opacity');
    await slider.fill('0.25');
    await vi.waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({ r: 1, g: 0, b: 0.5, a: 0.25 });
    });
  });

  test('falls back to white when initialValue is default', async () => {
    await render(
      <ColorPickerControl id="x" label="" initialValue={{ r: 1, g: 1, b: 1, a: 1 }} onChange={() => { }} />
    );
    const input = page.getByTestId('x-color');
    expect((input.element() as HTMLInputElement).value).toBe('#ffffff');
  });
});
