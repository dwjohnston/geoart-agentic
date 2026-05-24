import { describe, expect, test } from 'bun:test';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';

// I think what we're saying is that this import is ok for the purpose of the test.
// or you could create fake version of it for tests. 
// eslint-disable-next-line import/no-restricted-paths
import { realNodeRegistry } from '../exports';
import { compile } from './compiler';

describe('compiler param conversion', () => {
  test('preserves dx/dy on statically-declared colour points', () => {
    const graph: GeoArtGraph = {
      version: '2.0',
      control: { nodes: [] },
      compute: {
        nodes: [
          {
            id: 'rainbow',
            type: 'colorPointArrayCompute',
            params: {
              points: {
                v: [
                  { v: { x: -1, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 1, dy: 0 } },
                  { v: { x: 1, y: 0, r: 0, g: 0, b: 1, a: 1, dx: 0, dy: 1 } },
                ],
              },
            },
          },
        ],
      },
      render: { nodes: [] },
    };

    const compiled = compile(graph, realNodeRegistry);
    const points = compiled.nodes.get('rainbow')!.params.points;

    expect(points.v).toEqual([
      { x: -1, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 1, dy: 0 },
      { x: 1, y: 0, r: 0, g: 0, b: 1, a: 1, dx: 0, dy: 1 },
    ]);
  });

  test('defaults dx/dy to 0 when omitted', () => {
    const graph: GeoArtGraph = {
      version: '2.0',
      control: { nodes: [] },
      compute: {
        nodes: [
          {
            id: 'rainbow',
            type: 'colorPointArrayCompute',
            params: {
              points: {
                v: [{ v: { x: 0, y: 0, r: 1, g: 1, b: 1, a: 1 } }],
              },
            },
          },
        ],
      },
      render: { nodes: [] },
    };

    const compiled = compile(graph, realNodeRegistry);
    const points = compiled.nodes.get('rainbow')!.params.points;

    expect(points.v).toEqual([
      { x: 0, y: 0, r: 1, g: 1, b: 1, a: 1, dx: 0, dy: 0 },
    ]);
  });
});
