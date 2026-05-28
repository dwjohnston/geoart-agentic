import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { KnobControl } from './KnobControl';

test('renders small regular variant with label', async () => {
  await render(
    <KnobControl
      initialValue={5}
      min={0}
      max={10}
      size="sm"
      label="Speed"
    />
  );

  const knob = page.getByRole('slider', { name: 'Speed' });
  expect(knob).toBeInTheDocument();
  expect(knob).toHaveAttribute('aria-valuenow', '5');
  expect(knob).toHaveAttribute('aria-valuemin', '0');
  expect(knob).toHaveAttribute('aria-valuemax', '10');
});

test('renders large regular variant with label', async () => {
  await render(
    <KnobControl
      initialValue={75}
      min={0}
      max={100}
      size="lg"
      label="Frequency"
    />
  );

  const knob = page.getByRole('slider', { name: 'Frequency' });
  expect(knob).toBeInTheDocument();
  expect(knob).toHaveAttribute('aria-valuenow', '75');
  expect(knob).toHaveAttribute('aria-valuemin', '0');
  expect(knob).toHaveAttribute('aria-valuemax', '100');
});

test('renders coarse-fine variant with two knobs', async () => {
  await render(
    <KnobControl
      initialValue={50}
      min={0}
      max={100}
      step={0.01}
      variant="coarse-fine"
      size="lg"
      label="Amount"
    />
  );

  const coarseKnob = page.getByRole('slider', { name: /Amount \(coarse\)/ });
  const fineKnob = page.getByRole('slider', { name: /Amount \(fine\)/ });

  expect(coarseKnob).toBeInTheDocument();
  expect(fineKnob).toBeInTheDocument();
  expect(coarseKnob).toHaveAttribute('aria-valuemin', '0');
  expect(coarseKnob).toHaveAttribute('aria-valuemax', '100');
  expect(fineKnob).toHaveAttribute('aria-valuemin', '0');
  expect(fineKnob).toHaveAttribute('aria-valuemax', '1');
});

test('renders with logarithmic scale', async () => {
  await render(
    <KnobControl
      initialValue={10}
      min={1}
      max={100}
      step={0.01}
      scale="log"
      size="lg"
      label="Frequency"
    />
  );

  const knob = page.getByRole('slider', { name: 'Frequency' });
  expect(knob).toBeInTheDocument();
  expect(knob).toHaveAttribute('aria-valuenow', '10');
  expect(knob).toHaveAttribute('aria-valuemin', '1');
  expect(knob).toHaveAttribute('aria-valuemax', '100');
});
