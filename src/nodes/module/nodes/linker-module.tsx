import { implementModule } from '../implementModule';
import { createInternalId, createInputMarkerParams, renderIfNeeded } from '../moduleUtils';
import type { ModuleExpansionResult } from '../../../graphEngine/externalInterfaces/ModuleImplementation';
import type { NodeInputsDeclared } from '../../../schema/typeHelpers';
import { KnobControl } from '../../../ui/KnobControl';
import { ModulePanel } from '../../../ui/ModulePanel';

const linkerModuleImplementation = implementModule({
  _kind: 'linker-module',
  defaultValues: {
    intervalTicks: 6,
    pointsFrom: [],
    pointsTo: [],
  },

  provideNodes: (params, moduleId, defaultValues) => {
    const inputMarkerId = createInternalId(moduleId, 'input-marker');
    const fromInput = (key: keyof NodeInputsDeclared<'linker-module'>) => ({
      ref: `${inputMarkerId}.${key}`,
    });

    const modeSelectorId = createInternalId(moduleId, 'mode-selector');
    const intervalModeSelectorId = createInternalId(moduleId, 'interval-mode-selector');
    const timedLineArrayId = createInternalId(moduleId, 'timed-line-array');

    const result: ModuleExpansionResult<'linker-module'> = {
      controlNodes: [
        {
          id: modeSelectorId,
          type: 'timedLineArrayModeSelector',
          params: {
            label: { v: 'Mode' },
            value: { v: 'all-to-all' },
          },
        },
        {
          id: intervalModeSelectorId,
          type: 'timedLineArrayIntervalModeSelector',
          params: {
            label: { v: 'Interval mode' },
            value: { v: 'all' },
          },
        },
      ],
      computeNodes: [],
      renderNodes: [
        {
          id: timedLineArrayId,
          type: 'timedLineArray',
          renderConfig: { layer: 'paint' },
          params: {
            intervalTicks: fromInput('intervalTicks'),
            colorPointsA: fromInput('pointsFrom'),
            colorPointsB: fromInput('pointsTo'),
            mode: { ref: `${modeSelectorId}.value` },
            intervalMode: { ref: `${intervalModeSelectorId}.value` },
          },
        },
      ],
      inputMarkerNode: {
        id: inputMarkerId,
        type: 'module-input-marker',
        params: createInputMarkerParams(params, defaultValues),
        renderControl: (markerParams, set) => (
          <ModulePanel moduleName="Linker" moduleId={moduleId} data-testid={`${inputMarkerId}-controls`}>
            {renderIfNeeded(markerParams, 'intervalTicks', set, (initialValue, onChange) => (
              <KnobControl label="Interval ticks" min={0} max={60} initialValue={initialValue} onChange={onChange} />
            ))}
          </ModulePanel>
        ),
      },
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
      defaultValues,
    };

    return result;
  },
});

export default linkerModuleImplementation;
