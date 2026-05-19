import { describe, expect, test } from 'bun:test';
import { expandModules, type GraphWithModules } from './moduleExpander';
import type { ModuleDef } from '../../schema/modules/types';

// Minimal module for testing
const testModule: ModuleDef = {
  name: 'testModule',
  inputs: [
    {
      name: 'time',
      valueType: 'numberValue',
      controlNode: null,
      defaultValue: { v: 0 },
    },
    {
      name: 'value',
      valueType: 'numberValue',
      controlNode: {
        type: 'slider',
        defaultParams: {
          label: { v: 'Value' },
          min: { v: 0 },
          max: { v: 1 },
          value: { v: 0.5 },
          step: { v: 0.01 },
        },
      },
      defaultValue: { v: 0.5 },
    },
  ],
  outputs: [
    { name: 'result', getInternalRef: (id) => `${id}__compute.output` },
  ],
  buildNodes: (moduleId, resolvedInputs) => [
    {
      id: `${moduleId}__compute`,
      layer: 'compute',
      type: 'someCompute',
      params: {
        time: { ref: resolvedInputs.get('time')! },
        value: { ref: resolvedInputs.get('value')! },
      },
    },
  ],
};

const registry = new Map([['testModule', testModule]]);

function makeGraph(overrides: Partial<GraphWithModules> = {}): GraphWithModules {
  return {
    version: '2.0',
    modules: { nodes: [] },
    control: { nodes: [] },
    compute: { nodes: [] },
    render: { nodes: [] },
    ...overrides,
  };
}

describe('expandModules', () => {
  test('returns graph unchanged when no modules declared', () => {
    const graph = makeGraph();
    const result = expandModules(graph, registry);
    expect(result.control.nodes).toHaveLength(0);
    expect(result.compute.nodes).toHaveLength(0);
    expect(result.render.nodes).toHaveLength(0);
  });

  test('expands a module with a ref input — no control node materialised', () => {
    const graph = makeGraph({
      modules: {
        nodes: [{
          id: 'foo',
          type: 'module',
          module: 'testModule',
          params: {
            time: { ref: 'time.time' },
            value: { ref: 'someNode.output' },
          },
        }],
      },
    });

    const result = expandModules(graph, registry);

    // No control nodes should be generated (both inputs are refs)
    expect(result.control.nodes).toHaveLength(0);

    // The compute node should be added
    const computeNodes = result.compute.nodes as Array<{ id: string; params: Record<string, unknown> }>;
    expect(computeNodes).toHaveLength(1);
    expect(computeNodes[0].id).toBe('foo__compute');
    expect(computeNodes[0].params.time).toEqual({ ref: 'time.time' });
    expect(computeNodes[0].params.value).toEqual({ ref: 'someNode.output' });
  });

  test('materialises a control node for a static value input', () => {
    const graph = makeGraph({
      modules: {
        nodes: [{
          id: 'foo',
          type: 'module',
          module: 'testModule',
          params: {
            time: { ref: 'time.time' },
            value: { v: 0.8 },
          },
        }],
      },
    });

    const result = expandModules(graph, registry);

    // A slider control node should be materialised for 'value'
    const controlNodes = result.control.nodes as Array<{ id: string; type: string; params: Record<string, unknown> }>;
    expect(controlNodes).toHaveLength(1);
    expect(controlNodes[0].id).toBe('foo__value');
    expect(controlNodes[0].type).toBe('slider');
    expect((controlNodes[0].params.value as { v: unknown }).v).toBe(0.8);

    // The compute node wires 'value' to the generated control node
    const computeNodes = result.compute.nodes as Array<{ id: string; params: Record<string, unknown> }>;
    expect(computeNodes[0].params.value).toEqual({ ref: 'foo__value.value' });
  });

  test('materialises a control node with default value when input is omitted', () => {
    const graph = makeGraph({
      modules: {
        nodes: [{
          id: 'foo',
          type: 'module',
          module: 'testModule',
          params: {
            time: { ref: 'time.time' },
            // value is omitted → default 0.5 should be used
          },
        }],
      },
    });

    const result = expandModules(graph, registry);

    const controlNodes = result.control.nodes as Array<{ id: string; params: Record<string, unknown> }>;
    expect(controlNodes).toHaveLength(1);
    expect(controlNodes[0].id).toBe('foo__value');
    // Default value from controlNode.defaultParams should be used
    expect((controlNodes[0].params.value as { v: unknown }).v).toBe(0.5);
  });

  test('rewrites module output refs in existing compute nodes', () => {
    const graph = makeGraph({
      modules: {
        nodes: [{
          id: 'foo',
          type: 'module',
          module: 'testModule',
          params: { time: { ref: 'time.time' }, value: { ref: 'c.v' } },
        }],
      },
      compute: {
        nodes: [{
          id: 'bar',
          type: 'someOtherCompute',
          params: { input: { ref: 'foo.result' } },
        }],
      },
    });

    const result = expandModules(graph, registry);
    const computeNodes = result.compute.nodes as Array<{ id: string; params: Record<string, unknown> }>;
    // 'bar' should have its ref rewritten from 'foo.result' to 'foo__compute.output'
    const barNode = computeNodes.find((n) => n.id === 'bar');
    expect(barNode?.params.input).toEqual({ ref: 'foo__compute.output' });
  });

  test('rewrites module output refs in existing render nodes', () => {
    const graph = makeGraph({
      modules: {
        nodes: [{
          id: 'foo',
          type: 'module',
          module: 'testModule',
          params: { time: { ref: 'time.time' }, value: { ref: 'c.v' } },
        }],
      },
      render: {
        nodes: [{
          id: 'renderNode',
          type: 'circle',
          renderConfig: { layer: 'live' },
          params: { centerPoints: { ref: 'foo.result' } },
        }],
      },
    });

    const result = expandModules(graph, registry);
    const renderNodes = result.render.nodes as Array<{ id: string; params: Record<string, unknown> }>;
    const renderNode = renderNodes.find((n) => n.id === 'renderNode');
    expect(renderNode?.params.centerPoints).toEqual({ ref: 'foo__compute.output' });
  });

  test('throws for unknown module name', () => {
    const graph = makeGraph({
      modules: {
        nodes: [{
          id: 'foo',
          type: 'module',
          module: 'unknownModule',
          params: {},
        }],
      },
    });

    expect(() => expandModules(graph, registry)).toThrow('Unknown module "unknownModule"');
  });

  test('removes the modules section from the result', () => {
    const graph = makeGraph({
      modules: {
        nodes: [{
          id: 'foo',
          type: 'module',
          module: 'testModule',
          params: { time: { ref: 'time.time' }, value: { ref: 'c.v' } },
        }],
      },
    });

    const result = expandModules(graph, registry);
    expect(result.modules).toBeUndefined();
  });
});
