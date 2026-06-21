import { implementModule } from '../implementModule';
import { createInternalId, createInputMarkerParams, renderIfNeeded } from '../moduleUtils';
import type { ModuleExpansionResult } from '../../../graphEngine/externalInterfaces/ModuleImplementation';
import type { NodeInputsDeclared } from '../../../schema/typeHelpers';
import { KnobControl } from '../../../ui/KnobControl';
import { ModulePanel } from '../../../ui/ModulePanel';
import { DropdownControl } from '../../control/ui/DropdownControl';

const TIMED_LINE_ARRAY_MODES = ['all-to-all', 'distribute', 'interleave'] as const;
const TIMED_LINE_ARRAY_INTERVAL_MODES = ['all', 'cycle', 'back-and-forth', 'inside-out', 'inside-out-and-forth'] as const;

const linkerModuleImplementation = implementModule({
  _kind: 'linker-module',
  defaultValues: {
    intervalTicks: 6,
    pointsFrom: [],
    pointsTo: [],
    mode: 'all-to-all',
    intervalMode: 'all',
  },

  provideNodes: (params, moduleId, defaultValues) => {
    const inputMarkerId = createInternalId(moduleId, 'input-marker');
    const fromInput = (key: keyof NodeInputsDeclared<'linker-module'>) => ({
      ref: `${inputMarkerId}.${key}`,
    });

    const timedLineArrayId = createInternalId(moduleId, 'timed-line-array');

    const result: ModuleExpansionResult<'linker-module'> = {
      controlNodes: [],
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
            mode: fromInput('mode'),
            intervalMode: fromInput('intervalMode'),
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
            {renderIfNeeded(markerParams, 'mode', set, (initialValue, onChange) => (
              <DropdownControl id={`${inputMarkerId}-mode`} label="Mode" options={TIMED_LINE_ARRAY_MODES} initialValue={initialValue} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'intervalMode', set, (initialValue, onChange) => (
              <DropdownControl id={`${inputMarkerId}-interval-mode`} label="Interval mode" options={TIMED_LINE_ARRAY_INTERVAL_MODES} initialValue={initialValue} onChange={onChange} />
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
