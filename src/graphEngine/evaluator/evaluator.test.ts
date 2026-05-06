import { describe, expect, test, vi } from 'vitest';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import { compile } from '../compiler/compiler';
import { tick } from './evaluator';
import type { EvalContext } from './EvalContext';
import type { LegacyNodeRegistry } from '../externalInterfaces/AllNodeDefinitions';
import { computeRegistry } from '../../nodes/compute/registry';
import { renderRegistry } from '../../nodes/render/registry';
import { controlRegistry } from '../../nodes/control/registry';


const realNodeRegistry: LegacyNodeRegistry = {
  computeRegistry: computeRegistry,
  renderRegistry: renderRegistry,
  controlRegistry: controlRegistry
}

// ---------------------------------------------------------------------------
// Canvas mock factory
// ---------------------------------------------------------------------------

function makeGradientMock() {
  return { addColorStop: vi.fn() };
}

function makeCanvasMock(): CanvasRenderingContext2D {
  return {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    createLinearGradient: vi.fn(() => makeGradientMock()),
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 1,
  } as unknown as CanvasRenderingContext2D;
}

function makeCtx(tickCount: number): EvalContext {
  const stateStore = new Map<string, unknown>();
  return {
    tickCount,
    canvas: {
      orbit: makeCanvasMock(),
      trail: makeCanvasMock(),
      width: 800,
      height: 600,
    },
    getState<T>(): T {
      return stateStore.get('__root__') as T;
    },
    setState<T>(s: T): void {
      stateStore.set('__root__', s);
    },
  };
}

// ---------------------------------------------------------------------------
// Earth-Venus graph fixture
// ---------------------------------------------------------------------------

const earthVenus: GeoArtGraph = {
  version: '2.0',
  control: {
    nodes: [
      {
        id: 'earthSpeedSlider',
        type: 'slider',
        params: {
          label: { v: 'Earth Speed' },
          min: { v: 0 },
          max: { v: 1 },
          value: { v: 0.2 },
        },
      },
      {
        id: 'venusSpeedSlider',
        type: 'slider',
        params: {
          label: { v: 'Venus Speed' },
          min: { v: 0 },
          max: { v: 1 },
          value: { v: 0.33 },
        },
      },
    ],
  },
  compute: {
    nodes: [
      { id: 'time', type: 'time', params: {} },
      {
        id: 'earthOrbit',
        type: 'orbit',
        params: {
          time: { ref: 'time.time' },
          radius: { v: 0.6 },
          speed: { ref: 'earthSpeedSlider.value' },
        },
      },
      {
        id: 'venusOrbit',
        type: 'orbit',
        params: {
          time: { ref: 'time.time' },
          radius: { v: 0.3 },
          speed: { ref: 'venusSpeedSlider.value' },
        },
      },
      {
        id: 'earthColorPoint',
        type: 'colorPointCompute',
        params: {
          point: { ref: 'earthOrbit.point' },
          color: { v: { r: 0.3, g: 0.7, b: 1, a: 1 } },
        },
      },
      {
        id: 'venusColorPoint',
        type: 'colorPointCompute',
        params: {
          point: { ref: 'venusOrbit.point' },
          color: { v: { r: 1, g: 0.8, b: 0.2, a: 1 } },
        },
      },
    ],
  },
  render: {
    nodes: [
      {
        id: 'line',
        type: 'timedLine',
        renderConfig: { layer: 'paint' },
        params: {
          intervalTicks: { v: 1 },
          colorPointA: { ref: 'earthColorPoint.colorPoint' },
          colorPointB: { ref: 'venusColorPoint.colorPoint' },
        },
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('graph compiler and evaluator — Earth-Venus integration', () => {
  test('compile() does not throw', () => {
    expect(() => compile(earthVenus, realNodeRegistry)).not.toThrow();
  });

  test('sortedNodes contains all node IDs', () => {
    const compiled = compile(earthVenus, realNodeRegistry);
    const allIds = [
      'earthSpeedSlider',
      'venusSpeedSlider',
      'time',
      'earthOrbit',
      'venusOrbit',
      'earthColorPoint',
      'venusColorPoint',
      'line',
    ];
    expect(compiled.sortedNodes).toHaveLength(allIds.length);
    for (const id of allIds) {
      expect(compiled.sortedNodes).toContain(id);
    }
  });

  test('sortedNodes respects topological order (sources before sinks)', () => {
    const compiled = compile(earthVenus, realNodeRegistry);
    const idx = (id: string) => compiled.sortedNodes.indexOf(id);

    // time must come before earthOrbit and venusOrbit.
    expect(idx('time')).toBeLessThan(idx('earthOrbit'));
    expect(idx('time')).toBeLessThan(idx('venusOrbit'));

    // sliders must come before the orbits they drive.
    expect(idx('earthSpeedSlider')).toBeLessThan(idx('earthOrbit'));
    expect(idx('venusSpeedSlider')).toBeLessThan(idx('venusOrbit'));

    // Orbits must come before the line render node.
    expect(idx('earthOrbit')).toBeLessThan(idx('line'));
    expect(idx('venusOrbit')).toBeLessThan(idx('line'));
  });

  test('tick() at t=0 does not throw', () => {
    const compiled = compile(earthVenus, realNodeRegistry);
    expect(() => tick(compiled, 0, makeCtx(0))).not.toThrow();
  });

  test('tick() at t=500 does not throw', () => {
    const compiled = compile(earthVenus, realNodeRegistry);
    tick(compiled, 0, makeCtx(0));
    expect(() => tick(compiled, 500, makeCtx(500))).not.toThrow();
  });

  test('time node outputs the tick count', () => {
    const compiled = compile(earthVenus, realNodeRegistry);
    const ctx = makeCtx(42);
    tick(compiled, 42, ctx);
    const timeOutput = compiled.states.get('time')!.lastOutput;
    expect(timeOutput).toHaveLength(1);
    expect(timeOutput[0].kind).toBe('number');
    expect((timeOutput[0] as { kind: 'number'; v: number }).v).toBe(42);
  });

  test('compile() throws for unknown node type', () => {
    const badGraph: GeoArtGraph = {
      ...earthVenus,
      compute: {
        ...earthVenus.compute,
        nodes: [
          // @ts-expect-error — deliberately unknown type for the test
          { id: 'bogus', type: 'bogusNodeType', params: {} },
        ],
      },
    };
    expect(() => compile(badGraph, realNodeRegistry)).toThrow(/Unknown compute node type/);
  });

  test('compile() throws for ref to unknown node', () => {
    const badGraph: GeoArtGraph = {
      version: '2.0',
      control: { nodes: [] },
      compute: {
        nodes: [
          { id: 'time', type: 'time', params: {} },
          {
            id: 'orbit1',
            type: 'orbit',
            params: {
              time: { ref: 'nonexistent.time' },
            },
          },
        ],
      },
      render: { nodes: [] },
    };
    expect(() => compile(badGraph, realNodeRegistry)).toThrow(/unknown source node/i);
  });

  test('compile() throws for ref to unknown port', () => {
    const badGraph: GeoArtGraph = {
      version: '2.0',
      control: { nodes: [] },
      compute: {
        nodes: [
          { id: 'time', type: 'time', params: {} },
          {
            id: 'orbit1',
            type: 'orbit',
            params: {
              time: { ref: 'time.badPortName' },
            },
          },
        ],
      },
      render: { nodes: [] },
    };
    expect(() => compile(badGraph, realNodeRegistry)).toThrow(/no output port named/i);
  });
});
