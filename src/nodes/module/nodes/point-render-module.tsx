/**
 * Point Render Module Implementation
 *
 * Renders circles and crosshairs for an array of input points on the live layer.
 */

import { implementModule } from '../implementModule';
import { createInternalId, createInputMarkerParams } from '../moduleUtils';
import type { ModuleExpansionResult } from '../../../graphEngine/externalInterfaces/ModuleImplementation';
import type { NodeInputsDeclared } from '../../../schema/typeHelpers';

const pointRenderModuleImplementation = implementModule({
  _kind: "point-render-module",
  defaultValues: {
    points: [],
  },

  provideNodes: (params, moduleId, defaultValues) => {
    const inputMarkerNodeId = createInternalId(moduleId, 'input-marker');
    const computeNodeId = createInternalId(moduleId, 'arrow-head');

    const buildParamRef = (key: keyof NodeInputsDeclared<"point-render-module">) => {
      return {
        ref: `${inputMarkerNodeId}.${key}` as const
      }
    };

    // Create a compute node to pass through input points
    const computeNodes: ModuleExpansionResult<"point-render-module">['computeNodes'] = [
      {
        id: computeNodeId,
        type: 'curveModulator',
        params: {
          curve: buildParamRef('points'),
          fixedOffset: { v: 0.05 },
          modulationAngle: { v: 0 },
        },
      }];

    // Create render nodes for circles and crosshairs
    const renderNodes: ModuleExpansionResult<"point-render-module">['renderNodes'] = [
      {
        id: createInternalId(moduleId, 'circles'),
        type: 'circle',
        renderConfig: { layer: 'live', displayByDefault: true, tags: ['point'] },
        params: {
          radius: { v: 0.01 },
          centerPoints: buildParamRef('points')
        },
      },
      {
        id: createInternalId(moduleId, 'arrow-heads-render'),
        type: 'circle',
        renderConfig: { layer: 'live', displayByDefault: false, tags: ['cross', 'point'] },
        params: {
          radius: { v: 0.008 },
          centerPoints: { ref: `${computeNodeId}.points` }
        },
      },
      {
        id: createInternalId(moduleId, 'crosshairs'),
        type: 'linesThroughPoint',
        renderConfig: { layer: 'live', displayByDefault: false, tags: ['cross', 'point'] },
        params: {
          points: buildParamRef('points'),
          degrees: { v: [{ v: 0 }, { v: 90 }] },
          lineLength: { v: 0.05 }
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
          null
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
