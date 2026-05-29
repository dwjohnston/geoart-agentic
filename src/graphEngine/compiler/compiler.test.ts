import { describe, expect, test } from 'bun:test';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';

// I think what we're saying is that this import is ok for the purpose of the test.
// or you could create fake version of it for tests.
// eslint-disable-next-line import/no-restricted-paths
import { realNodeRegistry } from '../exports';
import { compile } from './compiler';


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
  test('expands a basic module to marker and internal nodes', () => {
    const graph: GeoArtGraph = {
      version: '2.0',
      control: { nodes: [] },
      compute: {
        nodes: [{
          type: "time",
          id: "time",
          params: {}
        }]
      },
      render: { nodes: [] },
      module: {
        nodes: [
          {
            id: 'my-orbit',
            type: 'orbit-module',
            params: {
              time: { ref: 'time.time' },
              speed: { v: 0.01 },
              radius: { v: 0.5 },
              numPoints: { v: 100 },
              centerPoints: { v: [{ v: { x: 0, y: 0, r: 1, g: 1, b: 1, a: 1 } }] },
              phase: { v: 0 },
              eccentricity: { v: 0 },
              tilt: { v: 0 },
            },
          },
        ],
      },
    };

    const compiled = compile(graph, realNodeRegistry);

    // Module expansion should produce a marker node
    expect(compiled.nodes.has('my-orbit')).toBe(true);
    const marker = compiled.nodes.get('my-orbit');
    expect(marker?.def.type).toBe('module-marker');

    // Should have internal nodes with namespaced IDs
    const internalNodes = Array.from(compiled.nodes.keys()).filter((id) =>
      id.startsWith('my-orbit:')
    );
    expect(internalNodes.length).toBeGreaterThan(0);
  });

  test('passes module param refs to internal nodes', () => {
    const graph: GeoArtGraph = {
      version: '2.0',
      control: {
        nodes: [{
          "id": "my-slider",
          type: "slider",
          params: {
            "label": { v: "my slider" },
            value: { v: 1 }
          }
        }]
      },
      compute: {
        nodes: [{
          type: "time",
          id: "time",
          params: {}
        }]
      },
      render: { nodes: [] },
      module: {
        nodes: [
          {
            id: 'my-orbit',
            type: 'orbit-module',
            params: {
              time: { ref: 'time.time' },
              speed: { ref: "my-slider.value" },
              radius: { v: 0.5 },
              numPoints: { v: 100 },
              centerPoints: { v: [{ v: { x: 0, y: 0, r: 1, g: 1, b: 1, a: 1 } }] },
              phase: { v: 0 },
              eccentricity: { v: 0 },
              tilt: { v: 0 },
            },
          },
        ],
      },
    };

    const compiled = compile(graph, realNodeRegistry);

    // Module expansion should produce a marker node
    expect(compiled.nodes.has('my-orbit')).toBe(true);
    const marker = compiled.nodes.get('my-orbit');
    expect(marker?.def.type).toBe('module-marker');

    // Should have internal nodes with namespaced IDs
    const internalNodes = Array.from(compiled.nodes.keys()).filter((id) =>
      id.startsWith('my-orbit:')
    );
    expect(internalNodes.length).toBeGreaterThan(0);

    // Find the internal orbit node and verify it has a ref to my-slider
    const orbitNode = internalNodes.find((id) => {
      const node = compiled.nodes.get(id);
      return node?.def.type === 'orbit';
    });
    expect(orbitNode).toBeDefined();

    // Check that the orbit node has a ref to my-slider in its edges
    const orbitNodeEdges = compiled.edges.filter((edge) => edge.toNode === orbitNode);
    const hasSliderRef = orbitNodeEdges.some((edge) => edge.fromNode === 'my-slider');
    expect(hasSliderRef).toBe(true);
  });


  test('allows downstream nodes to reference module marker outputs', () => {
    const graph: GeoArtGraph = {
      version: '2.0',
      control: { nodes: [] },
      compute: {
        nodes: [
          {
            id: 'use-orbit',
            type: 'colorPointArrayCompute',
            params: {
              points: {
                v: [{ ref: 'my-orbit.points' }],
              },
            },
          },
        ],
      },
      render: { nodes: [] },
      module: {
        nodes: [
          {
            id: 'my-orbit',
            type: 'orbit-module',
            params: {
              time: { v: 0 },
              speed: { v: 0.01 },
              radius: { v: 0.5 },
              numPoints: { v: 100 },
              centerPoints: { v: [{ v: { x: 0, y: 0, r: 1, g: 1, b: 1, a: 1 } }] },
              phase: { v: 0 },
              eccentricity: { v: 0 },
              tilt: { v: 0 },
            },
          },
        ],
      },
    };

    const compiled = compile(graph, realNodeRegistry);

    const marker = compiled.nodes.get('my-orbit');

    // Marker should exist and be a module-marker
    expect(marker).toBeDefined();
    expect(marker?.def.type).toBe('module-marker');

    // Compilation should succeed and have both the module and the downstream node
    expect(compiled.nodes.has('my-orbit')).toBe(true);
    expect(compiled.nodes.has('use-orbit')).toBe(true);

    // Check that 'use-orbit' has an edge coming from 'my-orbit'
    const useOrbitEdges = compiled.edges.filter((edge) => edge.toNode === 'use-orbit');
    const hasOrbitRef = useOrbitEdges.some((edge) => edge.fromNode === 'my-orbit');
    expect(hasOrbitRef).toBe(true);


  });


  test('handles multiple modules in same graph (seperate)', () => {
    const graph: GeoArtGraph = {
      version: '2.0',
      control: { nodes: [] },
      compute: { nodes: [] },
      render: { nodes: [] },
      module: {
        nodes: [
          {
            id: 'orbit-a',
            type: 'orbit-module',
            params: {
              time: { v: 0 },
              speed: { v: 0.01 },
              radius: { v: 0.5 },
              numPoints: { v: 100 },
              centerPoints: { v: [{ v: { x: 0, y: 0, r: 1, g: 1, b: 1, a: 1 } }] },
              phase: { v: 0 },
              eccentricity: { v: 0 },
              tilt: { v: 0 },
            },
          },
          {
            id: 'orbit-b',
            type: 'orbit-module',
            params: {
              time: { v: 0 },
              speed: { v: 0.02 },
              radius: { v: 0.3 },
              numPoints: { v: 50 },
              centerPoints: { v: [{ v: { x: 0, y: 0, r: 1, g: 1, b: 1, a: 1 } }] },
              phase: { v: 0 },
              eccentricity: { v: 0 },
              tilt: { v: 0 },
            },
          },
        ],
      },
    };

    const compiled = compile(graph, realNodeRegistry);

    // Should have both markers
    expect(compiled.nodes.has('orbit-a')).toBe(true);
    expect(compiled.nodes.has('orbit-b')).toBe(true);

    // Should have internal nodes for both, with separate namespaces
    const orbitAInternals = Array.from(compiled.nodes.keys()).filter((id) =>
      id.startsWith('orbit-a:')
    );
    const orbitBInternals = Array.from(compiled.nodes.keys()).filter((id) =>
      id.startsWith('orbit-b:')
    );

    expect(orbitAInternals.length).toBeGreaterThan(0);
    expect(orbitBInternals.length).toBeGreaterThan(0);

    // Namespaces should not overlap
    expect(orbitAInternals.some((id) => id.startsWith('orbit-b:'))).toBe(false);
    expect(orbitBInternals.some((id) => id.startsWith('orbit-a:'))).toBe(false);
  });

  test('handles multiple modules in same graph (depends on each other)', () => {
    const graph: GeoArtGraph = {
      version: '2.0',
      control: { nodes: [] },
      compute: { nodes: [] },
      render: { nodes: [] },
      module: {
        nodes: [
          {
            id: 'orbit-a',
            type: 'orbit-module',
            params: {
              time: { v: 0 },
              speed: { v: 0.01 },
              radius: { v: 0.5 },
              numPoints: { v: 100 },
              centerPoints: { v: [{ v: { x: 0, y: 0, r: 1, g: 1, b: 1, a: 1 } }] },
              phase: { v: 0 },
              eccentricity: { v: 0 },
              tilt: { v: 0 },
            },
          },
          {
            id: 'orbit-b',
            type: 'orbit-module',
            params: {
              time: { v: 0 },
              speed: { v: 0.02 },
              radius: { v: 0.3 },
              numPoints: { v: 50 },
              centerPoints: { ref: "orbit-a.points" },
              phase: { v: 0 },
              eccentricity: { v: 0 },
              tilt: { v: 0 },
            },
          },
        ],
      },
    };

    const compiled = compile(graph, realNodeRegistry);

    // Should have both markers
    expect(compiled.nodes.has('orbit-a')).toBe(true);
    expect(compiled.nodes.has('orbit-b')).toBe(true);


    expect(compiled.nodes.get('orbit-a')?.def.type).toBe("module-marker")
    expect(compiled.nodes.get('orbit-b')?.def.type).toBe("module-marker")


    // Should have internal nodes for both, with separate namespaces
    const orbitAInternals = Array.from(compiled.nodes.keys()).filter((id) =>
      id.startsWith('orbit-a:')
    );
    const orbitBInternals = Array.from(compiled.nodes.keys()).filter((id) =>
      id.startsWith('orbit-b:')
    );

    expect(orbitAInternals.length).toBeGreaterThan(0);
    expect(orbitBInternals.length).toBeGreaterThan(0);

    // Check that orbit-b's internal orbit node has a ref to orbit-a marker
    const orbitBNode = orbitBInternals.find((id) => {
      const node = compiled.nodes.get(id);
      return node?.def.type === 'orbit';
    });
    expect(orbitBNode).toBeDefined();

    const orbitBNodeEdges = compiled.edges.filter((edge) => edge.toNode === orbitBNode);
    const hasOrbitARef = orbitBNodeEdges.some((edge) => edge.fromNode === 'orbit-a');
    expect(hasOrbitARef).toBe(true);
  });
});
