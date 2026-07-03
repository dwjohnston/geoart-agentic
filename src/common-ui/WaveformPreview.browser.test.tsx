import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { WaveformPreview } from './WaveformPreview';

describe('WaveformPreview', () => {
  test('renders an SVG element', async () => {
    await render(<WaveformPreview signalFn={() => 0} cycleLength={60} />);
    const svg = page.getByTestId('waveform-preview');
    expect(svg).toBeInTheDocument();
  });

  test('renders a polyline with a non-empty points attribute', async () => {
    await render(<WaveformPreview signalFn={(t) => Math.sin(t)} cycleLength={60} />);
    const polyline = page.getByTestId('waveform-polyline');
    expect(polyline).toBeInTheDocument();
    const element = polyline.element() as SVGPolylineElement;
    expect(element.getAttribute('points')).toBeTruthy();
  });

  test('flat signal produces polyline with all y values equal to height/2', async () => {
    await render(<WaveformPreview signalFn={() => 0} cycleLength={60} />);
    const polyline = page.getByTestId('waveform-polyline');
    const element = polyline.element() as SVGPolylineElement;
    const points = element.getAttribute('points') ?? '';
    const yValues = points.trim().split(' ').map((pair) => Number(pair.split(',')[1]));
    expect(yValues.length).toBeGreaterThan(0);
    for (const y of yValues) {
      expect(y).toBeCloseTo(16);
    }
  });
});
