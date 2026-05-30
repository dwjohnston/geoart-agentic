import { describe, expect, test } from 'bun:test';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';

// I think what we're saying is that this import is ok for the purpose of the test.
// or you could create fake version of it for tests.
// eslint-disable-next-line import/no-restricted-paths
import { realNodeRegistry } from '../exports';
import { compile } from './compiler';
import { fColorPoint } from '../../constants';


/**
 * nb. there is an amount of implementation details being testing that is going on here
 * where we rely on the implementation of the orbit module for the tests to make sense
 * 
 * The much tidier approach would be for use to be able to define our own schemas just for the purposes of these tests. 
 */

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

describe('module expansion', () => {
  test('scenario 1: expands a module node with input from a regular node', () => {
    const graph: GeoArtGraph = {
      version: '2.0',
      control: { nodes: [] },
      compute: {
        nodes: [
          {
            id: 'globalTime',
            type: 'time',
            params: {}
          }
        ]
      },
      module: {
        nodes: [
          {
            id: 'myOrbit',
            type: 'orbit-module',
            params: {
              time: { ref: 'globalTime.time' },
              radius: { v: 0.2 },
              numPoints: { v: 8 },
              centerPoints: { v: [{ v: fColorPoint() }] }
            }
          }
        ]
      },
      render: { nodes: [] }
    };

    const compiled = compile(graph, realNodeRegistry);

    // After expansion, the compiled graph should contain:
    // 1. globalTime - regular compute node (unchanged)
    // 2. myOrbit:input-marker - module input marker (outputs: time, radius, numPoints, centerPoints, etc.)
    // 3. myOrbit:orbit - internal orbit compute node
    // 4. myOrbit:point-circle - internal render node (current point)
    // 5. myOrbit:orbit-path - internal render node (orbit outline)
    // 6. myOrbit:orbit-trace - internal render node (trace path)
    // 7. myOrbit - module output marker (exposes module outputs)

    expect(compiled.nodes.size).toBe(7)

    // Regular compute node should be unchanged
    expect(compiled.nodes.has('globalTime')).toBe(true);
    expect(compiled.nodes.get('globalTime')?.def.type).toBe('time');

    // Module input marker should exist
    expect(compiled.nodes.has('myOrbit:input-marker')).toBe(true);
    expect(compiled.nodes.get('myOrbit:input-marker')?.def.type).toBe('module-input-marker');

    // Internal orbit compute node should exist
    expect(compiled.nodes.has('myOrbit:orbit')).toBe(true);
    expect(compiled.nodes.get('myOrbit:orbit')?.def.type).toBe('orbit');

    // Internal render nodes should exist
    expect(compiled.nodes.has('myOrbit:point-circle')).toBe(true);
    expect(compiled.nodes.get('myOrbit:point-circle')?.def.type).toBe('circle');

    expect(compiled.nodes.has('myOrbit:orbit-path')).toBe(true);
    expect(compiled.nodes.get('myOrbit:orbit-path')?.def.type).toBe('circle');

    expect(compiled.nodes.has('myOrbit:orbit-trace')).toBe(true);
    expect(compiled.nodes.get('myOrbit:orbit-trace')?.def.type).toBe('circle');


    // Module output marker should exist
    expect(compiled.nodes.has('myOrbit')).toBe(true);
    expect(compiled.nodes.get('myOrbit')?.def.type).toBe('module-output-marker');
  });
});



