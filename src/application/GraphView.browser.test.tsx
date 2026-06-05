import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { GraphView } from './GraphView';
import minimalThreeNodeGraph from '../algorithms/reference/minimal/minimalThreeNodeReferenceGraph';
import { page } from 'vitest/browser';

test('renders a card for each node', async () => {
  await render(<GraphView graph={minimalThreeNodeGraph} />);

  expect(page.getByTestId('node-card-radius')).toBeDefined();
  expect(page.getByTestId('node-card-time')).toBeDefined();
  expect(page.getByTestId('node-card-earthOrbit')).toBeDefined();
  expect(page.getByTestId('node-card-circle')).toBeDefined();
});

test('renders edges for each connection', async () => {
  await render(<GraphView graph={minimalThreeNodeGraph} />);

  // time.time → earthOrbit
  expect(page.getByTestId('edge-time-earthOrbit')).toBeDefined();
  // radius.value → earthOrbit
  expect(page.getByTestId('edge-radius-earthOrbit')).toBeDefined();
  // earthOrbit.points → circle
  expect(page.getByTestId('edge-earthOrbit-circle')).toBeDefined();
});


