import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { SwingRangeControl } from './SwingRangeControl';

const baseProps = {
  min: -10,
  max: 10,
};

describe('SwingRangeControl', () => {
  test('renders min input with initial value', async () => {
    await render(<SwingRangeControl {...baseProps} onChange={() => {}} />);
    const input = page.getByTestId('swing-min');
    expect((input.element() as HTMLInputElement).value).toBe('-10');
  });

  test('renders max input with initial value', async () => {
    await render(<SwingRangeControl {...baseProps} onChange={() => {}} />);
    const input = page.getByTestId('swing-max');
    expect((input.element() as HTMLInputElement).value).toBe('10');
  });

  test('renders influence slider', async () => {
    await render(<SwingRangeControl {...baseProps} onChange={() => {}} />);
    const slider = page.getByTestId('swing-influence');
    expect(slider).toBeInTheDocument();
  });

  test('changing min input calls onChange with updated min value', async () => {
    const onChange = vi.fn();
    await render(<SwingRangeControl {...baseProps} onChange={onChange} />);
    const input = page.getByTestId('swing-min');
    await input.fill('-5');
    await vi.waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ min: -5 }));
    });
  });

  test('changing max input calls onChange with updated max value', async () => {
    const onChange = vi.fn();
    await render(<SwingRangeControl {...baseProps} onChange={onChange} />);
    const input = page.getByTestId('swing-max');
    await input.fill('20');
    await vi.waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ max: 20 }));
    });
  });

  test('setting influence to 0 calls onChange with min === max === midpoint', async () => {
    const onChange = vi.fn();
    await render(<SwingRangeControl {...baseProps} onChange={onChange} />);
    const slider = page.getByTestId('swing-influence');
    await slider.fill('0');
    await vi.waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({ min: 0, max: 0 });
    });
  });
});
