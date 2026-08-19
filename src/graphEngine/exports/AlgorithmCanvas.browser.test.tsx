import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { createRef } from 'react';
import { AlgorithmCanvas } from './AlgorithmCanvas';
import type { AlgorithmCanvasHandle } from './AlgorithmCanvas';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';

// Defined inline (rather than importing from `src/algorithms`) because this file lives in
// the `graphEngineExports` boundary zone, which isn't permitted to import the
// `algorithms` zone (see eslint.config.ts import/no-restricted-paths).
const testGraph: GeoArtGraph = {
  version: '2.0',
  control: { nodes: [] },
  compute: {
    nodes: [
      { id: 'time', type: 'time', params: {} },
      {
        id: 'orbit',
        type: 'orbit',
        params: { time: { ref: 'time.time' }, radius: { v: 0.1 }, speed: { v: 1 } },
      },
    ],
  },
  render: {
    nodes: [
      {
        id: 'circle',
        type: 'circle',
        renderConfig: { layer: 'live' },
        params: { radius: { v: 0.05 }, centerPoints: { ref: 'orbit.points' } },
      },
    ],
  },
};

test('renders live and paint canvases at the requested size', async () => {
  await render(<AlgorithmCanvas graph={testGraph} size={200} />);

  const live = page.getByTestId('live-canvas');
  const paint = page.getByTestId('paint-canvas');
  await expect.element(live).toBeInTheDocument();
  await expect.element(paint).toBeInTheDocument();
});

test('calls onLoad with the graph payload once loaded', async () => {
  const onLoad = vi.fn();
  await render(<AlgorithmCanvas graph={testGraph} size={200} onLoad={onLoad} />);

  await expect.poll(() => onLoad).toHaveBeenCalled();
  const payload = onLoad.mock.calls[0][0];
  expect(payload.renderingNodes.some((n: { nodeId: string }) => n.nodeId === 'circle')).toBe(true);
});

test('exposes an imperative handle for setSpeed and toggleRenderNode', async () => {
  const ref = createRef<AlgorithmCanvasHandle>();
  await render(<AlgorithmCanvas graph={testGraph} size={200} ref={ref} />);

  await expect.poll(() => ref.current).not.toBeNull();
  expect(() => ref.current!.setSpeed(2)).not.toThrow();
  expect(() => ref.current!.toggleRenderNode('circle')).not.toThrow();
});
