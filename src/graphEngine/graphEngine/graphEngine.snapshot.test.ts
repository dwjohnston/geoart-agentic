import { describe, expect, test } from 'vitest';
import { createGraphEngine } from './graphEngine';
import { testGraph } from './_testGraphs/testGraph';
import { wavingLinesGraph } from './_testGraphs/pointsOnALine';
import { createFakeContext } from './fakeContext';

const CANVAS_SIZE = 800;

describe('GraphEngine snapshot', () => {
  test.each([testGraph, wavingLinesGraph])('renders deterministically across ticks', (graph) => {
    const orbitCtx = createFakeContext();
    const trailCtx = createFakeContext();

    const engine = createGraphEngine(orbitCtx, trailCtx, CANVAS_SIZE);
    engine.load(graph);

    engine.tick();
    engine.tick();
    engine.tick();

    expect(orbitCtx.getCalls()).toMatchSnapshot();
    expect(trailCtx.getCalls()).toMatchSnapshot();
  });
});
