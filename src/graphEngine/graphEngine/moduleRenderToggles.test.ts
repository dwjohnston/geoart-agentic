import { describe, expect, test } from 'bun:test';
import { createGraphEngine } from './graphEngine';
import { createFakeContext } from '../../common-tooling/test-tooling/fakeContext';
// eslint-disable-next-line import/no-restricted-paths
import { realNodeRegistry } from '../exports';
import orbitModuleImplementation from '../../nodes/module/nodes/orbit-module';
import curveModulatorModuleImplementation from '../../nodes/module/nodes/curve-modulator-module';
import pointRenderModuleImplementation from '../../nodes/module/nodes/point-render-module';
import controlNodeToModuleReferenceGraph from '../../algorithms/reference/module/controlNodeToModule';
import curveModulatorModuleReferenceGraph from '../../algorithms/reference/module/curveModulatorModuleReferenceGraph';
import type { ModuleImplementationFn, ModuleRenderToggleInfo } from '../externalInterfaces/ModuleImplementation';
import type { LegacyNodeRegistry } from '../externalInterfaces/AllNodeImplementations';

/**
 * Wraps a module implementation so its renderControl captures the
 * ModuleRenderToggleInfo it receives, keyed by the module instance id, instead
 * of rendering its real UI. Used to inspect what graphEngine.ts computed
 * without depending on any particular module's own markup.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapCapturing<K extends string>(kind: K, impl: (params: any, moduleId: string) => any, captured: Map<string, ModuleRenderToggleInfo>): unknown {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wrapped = (params: any, moduleId: string) => {
    const result = impl(params, moduleId);
    return {
      ...result,
      inputMarkerNode: {
        ...result.inputMarkerNode,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        renderControl: (_p: any, _s: any, renderToggles: ModuleRenderToggleInfo) => {
          captured.set(moduleId, renderToggles);
          return null;
        },
      },
    };
  };
  (wrapped as unknown as { _kind: K })._kind = kind;
  return wrapped;
}

/**
 * graphEngine.ts's renderControlNodes() is responsible for computing, per module,
 * the list of that module's own render nodes plus their current enabled state, and
 * forwarding it (plus a toggle callback) as a third argument to the module's
 * renderControl. These tests wrap the real orbit-module implementation to capture
 * what it actually receives, without depending on any particular module's own UI.
 */
describe('graphEngine — module render toggle plumbing', () => {
  function buildEngineWithCapturingOrbitModule() {
    let captured: ModuleRenderToggleInfo | undefined;

    const wrappedOrbit = ((params: Parameters<typeof orbitModuleImplementation>[0], moduleId: string) => {
      const result = orbitModuleImplementation(params, moduleId);
      return {
        ...result,
        inputMarkerNode: {
          ...result.inputMarkerNode,
          renderControl: (
            p: Parameters<typeof result.inputMarkerNode.renderControl>[0],
            s: Parameters<typeof result.inputMarkerNode.renderControl>[1],
            renderToggles: ModuleRenderToggleInfo,
          ) => {
            captured = renderToggles;
            return null;
          },
        },
      };
    }) as unknown as ModuleImplementationFn<'orbit-module'>;
    wrappedOrbit._kind = 'orbit-module';

    const moduleRegistry = new Map(realNodeRegistry.moduleRegistry);
    moduleRegistry.set('orbit-module', wrappedOrbit as unknown as typeof realNodeRegistry.moduleRegistry extends Map<string, infer V> ? V : never);

    const customRegistry: LegacyNodeRegistry = { ...realNodeRegistry, moduleRegistry };

    const liveCtx = createFakeContext();
    const paintCtx = createFakeContext();
    const engine = createGraphEngine(liveCtx, paintCtx, 800, customRegistry);

    return { engine, getCaptured: () => captured };
  }

  test('a module only receives its own namespaced render nodes', () => {
    const { engine, getCaptured } = buildEngineWithCapturingOrbitModule();
    const payload = engine.load(controlNodeToModuleReferenceGraph);
    payload.renderControlNodes();

    const captured = getCaptured();
    expect(captured).toBeDefined();

    const nodeIds = captured!.nodes.map(n => n.nodeId).sort();
    expect(nodeIds).toEqual(['myOrbit:orbit-path', 'myOrbit:orbit-trace', 'myOrbit:point-circle']);
    // No leakage of nodes belonging to other modules or top-level nodes.
    expect(nodeIds.every(id => id.startsWith('myOrbit:'))).toBe(true);
  });

  test('each node reports its current enabled state, matching displayByDefault', () => {
    const { engine, getCaptured } = buildEngineWithCapturingOrbitModule();
    const payload = engine.load(controlNodeToModuleReferenceGraph);
    payload.renderControlNodes();

    const byId = Object.fromEntries(getCaptured()!.nodes.map(n => [n.nodeId, n.enabled]));
    expect(byId['myOrbit:point-circle']).toBe(true);
    expect(byId['myOrbit:orbit-path']).toBe(true);
    expect(byId['myOrbit:orbit-trace']).toBe(false);
  });

  test('the forwarded onToggle actually flips the engine\'s real toggle state', () => {
    const { engine, getCaptured } = buildEngineWithCapturingOrbitModule();
    const payload = engine.load(controlNodeToModuleReferenceGraph);
    payload.renderControlNodes();

    getCaptured()!.onToggle('myOrbit:point-circle');

    // Re-invoke renderControlNodes() to observe the updated enabled state,
    // the same way a re-render would after the engine's state changes.
    payload.renderControlNodes();
    const byId = Object.fromEntries(getCaptured()!.nodes.map(n => [n.nodeId, n.enabled]));
    expect(byId['myOrbit:point-circle']).toBe(false);
  });

  test('a nested module only sees its own render nodes, not its parent\'s or vice versa', () => {
    // curve-modulator-module ("modulator") nests point-render-module as
    // `modulator:point-render-module`, and owns its own `modulator:connect-dots`
    // render node directly. Each module's toggle list must stay scoped to just
    // its own direct render-node children.
    const captured = new Map<string, ModuleRenderToggleInfo>();

    const moduleRegistry = new Map(realNodeRegistry.moduleRegistry) as Map<string, unknown>;
    moduleRegistry.set('curve-modulator-module', wrapCapturing('curve-modulator-module', curveModulatorModuleImplementation, captured));
    moduleRegistry.set('point-render-module', wrapCapturing('point-render-module', pointRenderModuleImplementation, captured));

    const customRegistry = { ...realNodeRegistry, moduleRegistry } as unknown as LegacyNodeRegistry;
    const engine = createGraphEngine(createFakeContext(), createFakeContext(), 800, customRegistry);

    const payload = engine.load(curveModulatorModuleReferenceGraph);
    payload.renderControlNodes();

    const outer = captured.get('modulator');
    const nested = captured.get('modulator:point-render-module');
    expect(outer).toBeDefined();
    expect(nested).toBeDefined();

    const outerIds = outer!.nodes.map(n => n.nodeId).sort();
    const nestedIds = nested!.nodes.map(n => n.nodeId).sort();

    // The outer module sees only its own direct render node — not the nested
    // module's render nodes.
    expect(outerIds).toEqual(['modulator:connect-dots']);

    // The nested module sees only its own render nodes, correctly namespaced.
    expect(nestedIds.length).toBeGreaterThan(0);
    expect(nestedIds.every(id => id.startsWith('modulator:point-render-module:'))).toBe(true);

    // No overlap between the two lists.
    expect(outerIds.some(id => nestedIds.includes(id))).toBe(false);
  });
});
