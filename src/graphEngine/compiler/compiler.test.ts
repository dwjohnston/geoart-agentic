import { describe, expect, test } from 'bun:test';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';

// I think what we're saying is that this import is ok for the purpose of the test.
// or you could create fake version of it for tests.
// eslint-disable-next-line import/no-restricted-paths
import { realNodeRegistry } from '../exports';
import { compile } from './compiler';
import controlNodeToModuleReferenceGraph from "../../algorithms/reference/module/controlNodeToModule";
import moduleToRenderNodeReferenceGraph from "../../algorithms/reference/module/moduleToRenderNode";
import moduleToModuleReferenceGraph from "../../algorithms/reference/module/moduleToModule";

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


    const compiled = compile(controlNodeToModuleReferenceGraph, realNodeRegistry);

    // After expansion, the compiled graph should contain:
    // 1. globalTime - regular compute node (unchanged)
    // 2. radiusSlider - a regular control node
    // 3. myOrbit:input-marker - module input marker (outputs: time, radius, numPoints, centerPoints, etc.)
    // 4. myOrbit:orbit - internal orbit compute node
    // 5. myOrbit:point-circle - internal render node (current point)
    // 6. myOrbit:orbit-path - internal render node (orbit outline)
    // 7. myOrbit:orbit-trace - internal render node (trace path)
    // 8. myOrbit - module output marker (exposes module outputs)

    expect(compiled.nodes.size).toBe(8)

    // Regular compute node should be unchanged
    expect(compiled.nodes.has('globalTime')).toBe(true);
    expect(compiled.nodes.get('globalTime')?.def.type).toBe('time');

    expect(compiled.nodes.has('radiusSlider')).toBe(true);
    expect(compiled.nodes.get('radiusSlider')?.def.type).toBe('slider');

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


    // External refs route through input marker
    expect(compiled.edges).toContainEqual({
      fromNode: 'globalTime',
      fromPort: 0,
      toNode: 'myOrbit:input-marker',
      toPort: 0,
      arrayIndex: undefined,
    });

    expect(compiled.edges).toContainEqual({
      fromNode: 'radiusSlider',
      fromPort: 0,
      toNode: 'myOrbit:input-marker',
      toPort: 2,
      arrayIndex: undefined,
    });

    // Internal nodes reference the input marker
    expect(compiled.edges).toContainEqual({
      fromNode: 'myOrbit:input-marker',
      fromPort: 0,
      toNode: 'myOrbit:orbit',
      toPort: 0,
      arrayIndex: undefined,
    });

    expect(compiled.edges).toContainEqual({
      fromNode: 'myOrbit:input-marker',
      fromPort: 2,
      toNode: 'myOrbit:orbit',
      toPort: 1,
      arrayIndex: undefined,
    });

    expect(compiled.edges).toContainEqual({
      fromNode: 'myOrbit:input-marker',
      fromPort: 1,
      toNode: 'myOrbit:orbit',
      toPort: 2,
      arrayIndex: undefined,
    });
  });

  test('scenario 2: expands a module node whose output is used by a regular compute node', () => {

    const compiled = compile(moduleToRenderNodeReferenceGraph, realNodeRegistry);

    // After expansion, the compiled graph should contain:
    // 1. myOrbit:input-marker - module input marker
    // 2. myOrbit:orbit - internal orbit compute node
    // 3. myOrbit:point-circle - internal render node
    // 4. myOrbit:orbit-path - internal render node
    // 5. myOrbit:orbit-trace - internal render node
    // 6. myOrbit - module output marker (exposes module outputs like 'points')
    // 7. display - regular render node (now can reference myOrbit.points)

    expect(compiled.nodes.size).toBe(7);

    // Module nodes should be expanded
    expect(compiled.nodes.has('myOrbit:input-marker')).toBe(true);
    expect(compiled.nodes.has('myOrbit')).toBe(true);
    expect(compiled.nodes.get('myOrbit')?.def.type).toBe('module-output-marker');

    // Regular compute node should exist and reference module output marker
    expect(compiled.nodes.has('display')).toBe(true);
    expect(compiled.nodes.get('display')?.def.type).toBe('polygon');

    // ☝️ This isn't great. 
    // Verify edge from module's internal orbit output to display node

    expect(compiled.edges).toContainEqual({
      fromNode: 'myOrbit:orbit',
      fromPort: 1,
      toNode: 'display',
      toPort: 0,
      arrayIndex: undefined,
    });
  });

  test('scenario 3: expands modules where one module refs another module output', () => {

    const compiled = compile(moduleToModuleReferenceGraph, realNodeRegistry);

    // After expansion, the compiled graph should contain:
    // First module (orbit1):
    // 1. orbit1:input-marker
    // 2. orbit1:orbit
    // 3. orbit1:point-circle
    // 4. orbit1:orbit-path
    // 5. orbit1:orbit-trace
    // 6. orbit1 - module output marker

    // Second module (orbit2, refs first module):
    // 7. orbit2:input-marker
    // 8. orbit2:orbit
    // 9. orbit2:point-circle
    // 10. orbit2:orbit-path
    // 11. orbit2:orbit-trace
    // 12. orbit2 - module output marker

    expect(compiled.nodes.size).toBe(13);

    // First module should be expanded
    expect(compiled.nodes.has('orbit1:input-marker')).toBe(true);
    expect(compiled.nodes.get('orbit1:input-marker')?.def.type).toBe('module-input-marker');

    expect(compiled.nodes.has('orbit1')).toBe(true);
    expect(compiled.nodes.get('orbit1')?.def.type).toBe('module-output-marker');

    // Second module should be expanded
    expect(compiled.nodes.has('orbit2:input-marker')).toBe(true);
    expect(compiled.nodes.get('orbit2:input-marker')?.def.type).toBe('module-input-marker');

    expect(compiled.nodes.has('orbit2')).toBe(true);
    expect(compiled.nodes.get('orbit2')?.def.type).toBe('module-output-marker');

    // ☝️ This isn't great. 
    // Verify orbit1 output links to orbit2 input

    expect(compiled.edges).toContainEqual({
      fromNode: "orbit1:orbit",
      fromPort: 1,
      toNode: "orbit2:input-marker",
      toPort: 4,
      arrayIndex: undefined,
    })
    // The internal orbit node of the second module should ref its input marker
    expect(compiled.edges).toContainEqual({
      fromNode: 'orbit2:input-marker',
      fromPort: 1,
      toNode: 'orbit2:orbit',
      toPort: 2,
      arrayIndex: undefined,
    });

    console.log(compiled.edges)
  });
});



