import { describe, expect, test } from 'vitest';
import { createGraphEngine } from './graphEngine';
import { testGraph } from './testGraph';
import { createFakeContext } from './fakeContext';

const CANVAS_SIZE = 800;

describe('GraphEngine snapshot', () => {
  test('renders deterministically across ticks', () => {
    const orbitCtx = createFakeContext();
    const trailCtx = createFakeContext();

    const engine = createGraphEngine(orbitCtx, trailCtx, CANVAS_SIZE);
    engine.load(testGraph);

    engine.tick(0);
    engine.tick(10);
    engine.tick(20);

    expect(orbitCtx.getCalls()).toMatchSnapshot();
    expect(trailCtx.getCalls()).toMatchSnapshot();
  });
});
