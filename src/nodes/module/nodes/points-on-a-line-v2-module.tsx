import { implementModule } from '../implementModule';
import { createInternalId, createInputMarkerParams, renderIfNeeded } from '../moduleUtils';
import type { ModuleExpansionResult } from '../../../graphEngine/externalInterfaces/ModuleImplementation';
import type { NodeInputsDeclared } from '../../../schema/typeHelpers';
import { ModulePanel } from '../../../ui/ModulePanel';
import { DropdownControl } from '../../control/ui/DropdownControl';
import { KnobControl } from '../../../ui/KnobControl';

const CURVE_MODES = ['straight', 'catmull-rom'] as const;

const pointsOnALineV2ModuleImplementation = implementModule({
  _kind: 'points-on-a-line-v2-module',
  defaultValues: {
    colorPoints: [],
    numPoints: 10,
    curveMode: 'straight' as const,
  },

  provideNodes: (params, moduleId, defaultValues) => {
    const inputMarkerId = createInternalId(moduleId, 'input-marker');
    const computeId = createInternalId(moduleId, 'points-on-a-line-v2');
    const circlesId = createInternalId(moduleId, 'circles');

    const fromInput = (key: keyof NodeInputsDeclared<'points-on-a-line-v2-module'>) => ({
      ref: `${inputMarkerId}.${key}`,
    });

    const result: ModuleExpansionResult<'points-on-a-line-v2-module'> = {
      controlNodes: [],

      computeNodes: [
        {
          id: computeId,
          type: 'pointsOnALineV2',
          params: {
            colorPoints: fromInput('colorPoints'),
            numPoints: fromInput('numPoints'),
            curveMode: fromInput('curveMode'),
          },
        },
      ],

      renderNodes: [
        {
          id: circlesId,
          type: 'circle',
          renderConfig: { layer: 'live', displayByDefault: true, tags: ['points-on-a-line-v2', 'point'] },
          params: {
            centerPoints: { ref: `${computeId}.points` },
            radius: { v: 0.01 },
          },
        },
      ],

      inputMarkerNode: {
        id: inputMarkerId,
        type: 'module-input-marker',
        params: createInputMarkerParams(params, defaultValues),
        renderControl: (markerParams, set) => (
          <ModulePanel moduleName="Points on a Line V2" moduleId={moduleId} data-testid={`${inputMarkerId}-controls`}>
            {renderIfNeeded(markerParams, 'curveMode', set, (initialValue, onChange) => (
              <DropdownControl
                id={`${inputMarkerId}-curveMode`}
                label="Curve Mode"
                options={CURVE_MODES}
                initialValue={initialValue}
                onChange={onChange}
              />
            ))}
            {renderIfNeeded(markerParams, 'numPoints', set, (initialValue, onChange) => (
              <KnobControl
                label="Num Points"
                min={1}
                max={100}
                snapTo={1}
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
          points: { ref: `${computeId}.points` },
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

export default pointsOnALineV2ModuleImplementation;
