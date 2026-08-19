import { describe, expect, test } from 'bun:test';
import { createGraphEngine } from './graphEngine';
import { createFakeContext } from '../../common-tooling/test-tooling/fakeContext';
// eslint-disable-next-line import/no-restricted-paths
import { realNodeRegistry } from '../exports';
import orbitModuleImplementation from '../../nodes/module/nodes/orbit-module';
import controlNodeToModuleReferenceGraph from '../../algorithms/reference/module/controlNodeToModule';
import type { ModuleImplementationFn, ModuleRenderToggleInfo } from '../externalInterfaces/ModuleImplementation';
import type { LegacyNodeRegistry } from '../externalInterfaces/AllNodeImplementations';

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
});
