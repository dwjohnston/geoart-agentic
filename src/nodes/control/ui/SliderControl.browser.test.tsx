import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
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
    await render(<SliderControl {...baseProps} onChange={() => {}} />);
    const label = document.body.querySelector('label');
    expect(label?.textContent).toContain('Speed');
    expect(document.body.querySelector('input[type="range"]')).toBeTruthy();
  });

  test('respects min, max, step props', async () => {
    await render(
      <SliderControl id="x" label="" min={0} max={1} step={0.1} initialValue={0} onChange={() => {}} />
    );
    const slider = document.body.querySelector('input[type="range"]') as HTMLInputElement;
    expect(Number(slider.min)).toBe(0);
    expect(Number(slider.max)).toBe(1);
    expect(Number(slider.step)).toBe(0.1);
  });

  test('initialises with initialValue', async () => {
    await render(
      <SliderControl id="x" label="" min={0} max={10} step={1} initialValue={7} onChange={() => {}} />
    );
    const slider = document.body.querySelector('input[type="range"]') as HTMLInputElement;
    expect(Number(slider.value)).toBe(7);
  });

  test('displays value rounded to step decimal places', async () => {
    await render(
      <SliderControl id="x" label="" min={0} max={10} step={0.1} initialValue={3.14159} onChange={() => {}} />
    );
    const output = document.body.querySelector('output') as HTMLOutputElement;
    expect(output.textContent).toBe('3.1');
  });

  test('displays integer value when step is whole number', async () => {
    await render(
      <SliderControl id="x" label="" min={0} max={10} step={1} initialValue={3.7} onChange={() => {}} />
    );
    const output = document.body.querySelector('output') as HTMLOutputElement;
    expect(output.textContent).toBe('4');
  });
});
