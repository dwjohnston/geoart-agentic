import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { WaveBindingButton } from './WaveBindingButton';

const sineWave = (t: number) => Math.sin((t / 1) * Math.PI * 2);

const availableWaves = [
  { id: 'wave-a', name: 'Sine A', signalFn: sineWave, cycleLength: 1 },
  { id: 'wave-b', name: 'Sine B', signalFn: sineWave, cycleLength: 2 },
];

describe('WaveBindingButton', () => {
  test('unbound: shows bind button, picker not visible', async () => {
    await render(
      <WaveBindingButton
        boundWaveId={null}
        availableWaves={availableWaves}
        onBind={() => {}}
        onUnbind={() => {}}
      />
    );
    expect(page.getByTestId('wave-bind-btn')).toBeInTheDocument();
    expect(page.getByTestId('wave-picker').query()).toBeNull();
  });

  test('unbound: clicking bind button opens picker', async () => {
    await render(
      <WaveBindingButton
        boundWaveId={null}
        availableWaves={availableWaves}
        onBind={() => {}}
        onUnbind={() => {}}
      />
    );
    await page.getByTestId('wave-bind-btn').click();
    expect(page.getByTestId('wave-picker')).toBeInTheDocument();
  });

  test('picker: shows one entry per available wave', async () => {
    await render(
      <WaveBindingButton
        boundWaveId={null}
        availableWaves={availableWaves}
        onBind={() => {}}
        onUnbind={() => {}}
      />
    );
    await page.getByTestId('wave-bind-btn').click();
    expect(page.getByTestId('wave-option-wave-a')).toBeInTheDocument();
    expect(page.getByTestId('wave-option-wave-b')).toBeInTheDocument();
  });

  test('picker: clicking a wave option calls onBind with correct id', async () => {
    const onBind = vi.fn();
    await render(
      <WaveBindingButton
        boundWaveId={null}
        availableWaves={availableWaves}
        onBind={onBind}
        onUnbind={() => {}}
      />
    );
    await page.getByTestId('wave-bind-btn').click();
    await page.getByTestId('wave-option-wave-b').click();
    expect(onBind).toHaveBeenCalledWith('wave-b');
  });

  test('bound: shows wave name, bind button not visible', async () => {
    await render(
      <WaveBindingButton
        boundWaveId="wave-a"
        availableWaves={availableWaves}
        onBind={() => {}}
        onUnbind={() => {}}
      />
    );
    expect(page.getByText('Sine A')).toBeInTheDocument();
    expect(page.getByTestId('wave-bind-btn').query()).toBeNull();
  });

  test('bound: clicking × calls onUnbind', async () => {
    const onUnbind = vi.fn();
    await render(
      <WaveBindingButton
        boundWaveId="wave-a"
        availableWaves={availableWaves}
        onBind={() => {}}
        onUnbind={onUnbind}
      />
    );
    await page.getByTestId('wave-unbind-btn').click();
    expect(onUnbind).toHaveBeenCalled();
  });
});
