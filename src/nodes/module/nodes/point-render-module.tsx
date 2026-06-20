/**
 * Point Render Module Implementation
 *
 * Renders circles and crosshairs for an array of input points on the live layer.
 */

import { implementModule } from '../implementModule';
import { createInternalId, createInputMarkerParams } from '../moduleUtils';
import type { ModuleExpansionResult } from '../../../graphEngine/externalInterfaces/ModuleImplementation';
import type { NodeInputsDeclared } from '../../../schema/typeHelpers';
import { ModulePanel } from '../../../ui/ModulePanel';

const pointRenderModuleImplementation = implementModule({
  _kind: "point-render-module",
  defaultValues: {
    points: [],
  },

  provideNodes: (params, moduleId, defaultValues) => {
    const inputMarkerNodeId = createInternalId(moduleId, 'input-marker');
    const computeNodeId = createInternalId(moduleId, 'add-gradient');

    const buildParamRef = (key: keyof NodeInputsDeclared<"point-render-module">) => {
      return {
        ref: `${inputMarkerNodeId}.${key}` as const
      }
    };

    // Create a compute node to pass through input points
    const computeNodes: ModuleExpansionResult<"point-render-module">['computeNodes'] = [{
      id: computeNodeId,
      type: 'colorPointArrayCompute',
      params: {
        points: buildParamRef('points'),
      },
    }];

    // Create render nodes for circles and crosshairs
    const renderNodes: ModuleExpansionResult<"point-render-module">['renderNodes'] = [
      {
        id: createInternalId(moduleId, 'circles'),
        type: 'circle',
        renderConfig: { layer: 'live' },
        params: {
          radius: { v: 0.01 },
          centerPoints: { ref: `${computeNodeId}.points` }
        },
      },
      {
        id: createInternalId(moduleId, 'crosshairs'),
        type: 'linesThroughPoint',
        renderConfig: { layer: 'live' },
        params: {
          points: { ref: `${computeNodeId}.points` },
          degrees: { v: [{ v: 0 }, { v: 90 }] },
          lineLength: { v: 0.1 }
        },
      },
    ];

    const result: ModuleExpansionResult<"point-render-module"> = {
      controlNodes: [],
      computeNodes,
      renderNodes,
      inputMarkerNode: {
        id: inputMarkerNodeId,
        type: "module-input-marker",
        params: createInputMarkerParams(params, defaultValues),
        renderControl: () => (
          <ModulePanel moduleName="Point Render" moduleId={moduleId} data-testid={`${inputMarkerNodeId}-controls`}>
            {null}
          </ModulePanel>
        ),
      },
      defaultValues,
      outputMarkerNode: {
        id: moduleId,
        type: 'module-output-marker',
        params: {},
        outputRefs: {},
        nodeSource: {
          sourceType: 'module',
          sourceId: moduleId,
        },
      },
    };

    return result;
  }
});

export default pointRenderModuleImplementation;
