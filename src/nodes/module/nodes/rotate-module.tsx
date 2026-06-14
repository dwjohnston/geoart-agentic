import { implementModule } from '../implementModule';
import { createInternalId, createInputMarkerParams } from '../moduleUtils';
import type { ModuleExpansionResult } from '../../../graphEngine/externalInterfaces/ModuleImplementation';
import type { NodeInputsDeclared } from '../../../schema/typeHelpers';
import { ModulePanel } from '../../../ui/ModulePanel';

const rotateModuleImplementation = implementModule({
  _kind: 'rotate-module',
  defaultValues: {
    inputPoints: [],
    rotationCenters: [],
    rotationAmount: 0,
  },

  provideNodes: (params, moduleId, defaultValues) => {
    const inputMarkerId = createInternalId(moduleId, 'input-marker');
    const rotateId = createInternalId(moduleId, 'rotate');
    const rotationCirclesId = createInternalId(moduleId, 'rotation-circles');

    const fromInput = (key: keyof NodeInputsDeclared<'rotate-module'>) => ({
      ref: `${inputMarkerId}.${key}`,
    });

    const result: ModuleExpansionResult<'rotate-module'> = {
      controlNodes: [],

      computeNodes: [
        {
          id: rotateId,
          type: 'rotate',
          params: {
            inputPoints: fromInput('inputPoints'),
            rotationCenters: fromInput('rotationCenters'),
            rotationAmount: fromInput('rotationAmount'),
          },
        },
      ],

      renderNodes: [
        {
          id: rotationCirclesId,
          type: 'circle',
          renderConfig: { layer: 'live', displayByDefault: true, tags: ['rotate', 'center'] },
          params: {
            centerPoints: fromInput('rotationCenters'),
            radius: { v: 0.015 },
            intervalTicks: { v: 0 },
            eccentricity: { v: 0 },
            tilt: { v: 0 },
          },
        },
      ],

      inputMarkerNode: {
        id: inputMarkerId,
        type: 'module-input-marker',
        params: createInputMarkerParams(params, defaultValues),
        renderControl: (_markerParams, _set) => (
          <ModulePanel moduleName="Rotate" moduleId={moduleId} data-testid={`${inputMarkerId}-controls`}>{null}</ModulePanel>
        ),
      },

      outputMarkerNode: {
        id: moduleId,
        type: 'module-output-marker',
        params: {},
        outputRefs: {
          points: { ref: `${rotateId}.points` },
        },
        nodeSource: {
          sourceType: 'module',
          sourceId: moduleId,
        },
      },

      defaultValues,
    };

    return result;
  },
});

export default rotateModuleImplementation;
