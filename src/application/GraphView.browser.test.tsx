import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { GraphView } from './GraphView';
import minimalThreeNodeGraph from '../algorithms/reference/minimal/minimalThreeNodeReferenceGraph';
import singleModuleGraph from '../algorithms/reference/module/singleModule';
import moduleToRenderNodeGraph from '../algorithms/reference/module/moduleToRenderNode';
import moduleToModuleGraph from '../algorithms/reference/module/moduleToModule';
import controlNodeToModuleGraph from '../algorithms/reference/module/controlNodeToModule';
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

test('renders a card for a module node and its compute → module edge', async () => {
  await render(<GraphView graph={singleModuleGraph} />);

  expect(page.getByTestId('node-card-myOrbit')).toBeDefined();
  // globalTime.time → myOrbit
  expect(page.getByTestId('edge-globalTime-myOrbit')).toBeDefined();
});

test('renders a module → render edge', async () => {
  await render(<GraphView graph={moduleToRenderNodeGraph} />);

  expect(page.getByTestId('node-card-myOrbit')).toBeDefined();
  expect(page.getByTestId('node-card-display')).toBeDefined();
  // myOrbit.points → display
  expect(page.getByTestId('edge-myOrbit-display')).toBeDefined();
});

test('renders a module → module edge', async () => {
  await render(<GraphView graph={moduleToModuleGraph} />);

  expect(page.getByTestId('node-card-orbit1')).toBeDefined();
  expect(page.getByTestId('node-card-orbit2')).toBeDefined();
  // orbit1.points → orbit2
  expect(page.getByTestId('edge-orbit1-orbit2')).toBeDefined();
});

test('renders a control → module edge', async () => {
  await render(<GraphView graph={controlNodeToModuleGraph} />);

  expect(page.getByTestId('node-card-radiusSlider')).toBeDefined();
  expect(page.getByTestId('node-card-myOrbit')).toBeDefined();
  // radiusSlider.value → myOrbit
  expect(page.getByTestId('edge-radiusSlider-myOrbit')).toBeDefined();
});


