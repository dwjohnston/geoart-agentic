import { implementModule } from '../implementModule';
import { createInternalId, createInputMarkerParams, renderIfNeeded } from '../moduleUtils';
import type { ModuleExpansionResult } from '../../../graphEngine/externalInterfaces/ModuleImplementation';
import type { NodeInputsDeclared } from '../../../schema/typeHelpers';
import { KnobControl } from '../../../ui/KnobControl';
import { ModulePanel } from '../../../ui/ModulePanel';
import { DropdownControl } from '../../control/ui/DropdownControl';

const COLOR_SHIFT_MODES = ['proximity', 'proximity-with-direction'] as const;

const colorShiftModuleImplementation = implementModule({
  _kind: 'color-shift-module',
  defaultValues: {
    inputPoints: [],
    targetPoints: [],
    falloff: 1,
    strength: 1,
    mode: 'proximity',
  },

  provideNodes: (params, moduleId, defaultValues) => {
    const inputMarkerId = createInternalId(moduleId, 'input-marker');
    const colorShiftId = createInternalId(moduleId, 'color-shift');
    const targetCirclesId = createInternalId(moduleId, 'target-circles');

    const fromInput = (key: keyof NodeInputsDeclared<'color-shift-module'>) => ({
      ref: `${inputMarkerId}.${key}`,
    });

    const result: ModuleExpansionResult<'color-shift-module'> = {
      controlNodes: [],
      computeNodes: [
        {
          id: colorShiftId,
          type: 'colorShift',
          params: {
            inputPoints: fromInput('inputPoints'),
            targetPoints: fromInput('targetPoints'),
            falloff: fromInput('falloff'),
            strength: fromInput('strength'),
            mode: fromInput('mode'),
          },
        },
      ],
      renderNodes: [
        {
          id: targetCirclesId,
          type: 'circle',
          renderConfig: { layer: 'live', displayByDefault: true, tags: ['point'] },
          params: {
            centerPoints: fromInput('targetPoints'),
            radius: { v: 0.01 },
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
        renderControl: (markerParams, set) => (
          <ModulePanel moduleName="Colour Shift" moduleId={moduleId} data-testid={`${inputMarkerId}-controls`}>
            {renderIfNeeded(markerParams, 'mode', set, (initialValue, onChange) => (
              <DropdownControl id={`${inputMarkerId}-mode`} label="Mode" options={COLOR_SHIFT_MODES} initialValue={initialValue} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'falloff', set, (initialValue, onChange) => (
              <KnobControl label="Falloff" min={0} max={5} initialValue={initialValue} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'strength', set, (initialValue, onChange) => (
              <KnobControl label="Strength" min={0} max={1} initialValue={initialValue} onChange={onChange} />
            ))}
          </ModulePanel>
        ),
      },
      outputMarkerNode: {
        id: moduleId,
        type: 'module-output-marker',
        params: {},
        outputRefs: {
          points: { ref: `${colorShiftId}.points` },
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

export default colorShiftModuleImplementation;
