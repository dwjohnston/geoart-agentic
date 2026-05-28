import { render } from '@testing-library/react';
import { test } from 'vitest';
import { GraphView } from './GraphView';
import minimalThreeNodeGraph from '../algorithms/reference/minimal/minimalThreeNodeReferenceGraph';

test('renders a card for each node', () => {
  const { getByTestId } = render(<GraphView graph={minimalThreeNodeGraph} />);

  getByTestId('node-card-radius');
  getByTestId('node-card-time');
  getByTestId('node-card-earthOrbit');
  getByTestId('node-card-circle');
});

test('renders edges for each connection', () => {
  const { getByTestId } = render(<GraphView graph={minimalThreeNodeGraph} />);

  // time.time → earthOrbit
  getByTestId('edge-time-earthOrbit');
  // radius.value → earthOrbit
  getByTestId('edge-radius-earthOrbit');
  // earthOrbit.points → circle
  getByTestId('edge-earthOrbit-circle');
});
