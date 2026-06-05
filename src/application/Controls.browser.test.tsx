import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { Controls } from './Controls';
import { createGraphEngine } from '../graphEngine/exports';
import type { GeoArtGraph } from '../schema/_generated/schema-types';
import moduleToModule from '../algorithms/reference/module/moduleToModule';
import earthVenus from '../algorithms/reference/general/earthVenus';

const CANVAS_SIZE = 800;

function setupGraphEngine(graph: GeoArtGraph) {
  const orbitCanvas = document.createElement('canvas');
  const trailCanvas = document.createElement('canvas');

  const orbitCtx = orbitCanvas.getContext('2d')!;
  const trailCtx = trailCanvas.getContext('2d')!;

  const engine = createGraphEngine(orbitCtx, trailCtx, CANVAS_SIZE);
  return engine.load(graph);
}

test('renders empty state with no controls', async () => {
  await render(
    <Controls renderControlNodes={() => null} />
  );

  const container = page.getByTestId('controls-container');
  expect(container).toBeInTheDocument();
});

test('renders with control nodes from moduleToModule graph', async () => {
  const payload = setupGraphEngine(moduleToModule);

  await render(
    <Controls renderControlNodes={payload.renderControlNodes} />
  );

  const container = page.getByTestId('controls-container');
  expect(container).toBeInTheDocument();

  const firstHelloWorld = page.getByTestId('orbit1:input-marker-controls');
  const secondHelloWorld = page.getByTestId('orbit2:input-marker-controls');
  expect(firstHelloWorld).toBeInTheDocument();
  expect(secondHelloWorld).toBeInTheDocument();
});

test('renders with control nodes from earthVenus graph', async () => {
  const payload = setupGraphEngine(earthVenus);

  await render(
    <Controls renderControlNodes={payload.renderControlNodes} />
  );

  const container = page.getByTestId('controls-container');
  expect(container).toBeInTheDocument();

  expect(page.getByRole('slider', { name: /Earth Speed/ })).toBeInTheDocument();
  expect(page.getByRole('slider', { name: /Earth Distance/ })).toBeInTheDocument();
  expect(page.getByRole('slider', { name: /Venus Speed/ })).toBeInTheDocument();
  expect(page.getByRole('slider', { name: /Venus Distance/ })).toBeInTheDocument();
  expect(page.getByRole('slider', { name: /Link Rate/ })).toBeInTheDocument();
});
