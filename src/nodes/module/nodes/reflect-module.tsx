import { implementModule } from '../implementModule';
import { createInternalId, createInputMarkerParams, renderIfNeeded } from '../moduleUtils';
import type { ModuleExpansionResult } from '../../../graphEngine/externalInterfaces/ModuleImplementation';
import type { NodeInputsDeclared } from '../../../schema/typeHelpers';
import { ModulePanel } from '../../../ui/ModulePanel';
import { DropdownControl } from '../../control/ui/DropdownControl';

const COLOR_SHIFT_OPERATIONS = ['none', 'blend', 'hue-shift', 'lighten', 'saturate'] as const;

const reflectModuleImplementation = implementModule({
  _kind: 'reflect-module',
  defaultValues: {
    inputPoints: [],
    reflectionPoints: [],
    colorShiftOperation: 'none' as const,
  },

  provideNodes: (params, moduleId, defaultValues) => {
    const inputMarkerId = createInternalId(moduleId, 'input-marker');
    const reflectId = createInternalId(moduleId, 'reflect');
    const reflectionCirclesId = createInternalId(moduleId, 'reflection-circles');
    const reflectionTangentsId = createInternalId(moduleId, 'reflection-tangents');

    const fromInput = (key: keyof NodeInputsDeclared<'reflect-module'>) => ({
      ref: `${inputMarkerId}.${key}`,
    });

    const result: ModuleExpansionResult<'reflect-module'> = {
      controlNodes: [],

      computeNodes: [
        {
          id: reflectId,
          type: 'reflect',
          params: {
            inputPoints: fromInput('inputPoints'),
            reflectionPoints: fromInput('reflectionPoints'),
            colorShiftOperation: fromInput('colorShiftOperation'),
          },
        },
      ],

      renderNodes: [
        {
          id: reflectionCirclesId,
          type: 'circle',
          renderConfig: { layer: 'live', displayByDefault: true, tags: ['reflect', 'point'] },
          params: {
            centerPoints: fromInput('reflectionPoints'),
            radius: { v: 0.015 },
            intervalTicks: { v: 0 },
            eccentricity: { v: 0 },
            tilt: { v: 0 },
          },
        },
        {
          id: reflectionTangentsId,
          type: 'linesThroughPoint',
          renderConfig: { layer: 'live', displayByDefault: true, tags: ['reflect', 'tangent'] },
          params: {
            // linesThroughPoint skips points with dx=dy=0 natively
            points: fromInput('reflectionPoints'),
            degrees: { v: [{ v: 0 }] },
            lineLength: { v: 0.1 },
          },
        },
      ],

      inputMarkerNode: {
        id: inputMarkerId,
        type: 'module-input-marker',
        params: createInputMarkerParams(params, defaultValues),
        renderControl: (markerParams, set) => (
          <ModulePanel moduleName="Reflect" moduleId={moduleId} data-testid={`${inputMarkerId}-controls`}>
            {renderIfNeeded(markerParams, 'colorShiftOperation', set, (initialValue, onChange) => (
              <DropdownControl
                id={`${inputMarkerId}-colorShiftOperation`}
                label="Color Shift"
                options={COLOR_SHIFT_OPERATIONS}
                initialValue={initialValue}
                onChange={onChange}
              />
            ))}
          </ModulePanel>
        ),
      },

      outputMarkerNode: {
        id: moduleId,
        type: 'module-output-marker',
        params: {},
        outputRefs: {
          points: { ref: `${reflectId}.points` },
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

export default reflectModuleImplementation;
