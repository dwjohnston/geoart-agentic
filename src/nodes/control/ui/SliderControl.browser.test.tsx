import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { SliderControl } from './SliderControl';

const baseProps = {
  id: 'speed',
  label: 'Speed',
  min: 0,
  max: 10,
  step: 1,
  initialValue: 3,
};

describe('SliderControl', () => {
  test('renders label and input element', async () => {
    await render(<SliderControl {...baseProps} onChange={() => { }} />);
    const label = page.getByText('Speed');
    expect(label).toBeInTheDocument();
    const slider = page.getByRole('slider');
    expect(slider).toBeInTheDocument();
  });

  test('respects min, max, step props', async () => {
    await render(
      <SliderControl id="x" label="" min={0} max={1} step={0.1} initialValue={0} onChange={() => { }} />
    );
    const slider = page.getByRole('slider');
    const element = slider.element() as SVGElement;
    expect(element.getAttribute('aria-valuemin')).toBe('0');
    expect(element.getAttribute('aria-valuemax')).toBe('1');
  });

  test('initialises with initialValue', async () => {
    await render(
      <SliderControl id="x" label="" min={0} max={10} step={1} initialValue={7} onChange={() => { }} />
    );
    const slider = page.getByRole('slider');
    const element = slider.element() as SVGElement;
    expect(Number(element.getAttribute('aria-valuenow'))).toBe(7);
  });

  test('displays value rounded to step decimal places', async () => {
    await render(
      <SliderControl id="x" label="" min={0} max={10} step={0.1} initialValue={3.14159} onChange={() => { }} />
    );
    const output = page.getByTestId('x-output');
    expect(output).toHaveTextContent('3.1');
  });

});
