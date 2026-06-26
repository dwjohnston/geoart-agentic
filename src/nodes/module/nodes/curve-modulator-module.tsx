import { implementModule } from '../implementModule';
import { createInternalId, createInputMarkerParams, renderIfNeeded } from '../moduleUtils';
import type { ModuleExpansionResult } from '../../../graphEngine/externalInterfaces/ModuleImplementation';
import type { NodeInputsDeclared } from '../../../schema/typeHelpers';
import { KnobControl } from '../../../ui/KnobControl';
import { ModulePanel } from '../../../ui/ModulePanel';
import { DropdownControl } from '../../control/ui/DropdownControl';

const CYCLE_LENGTH_MODES = ['arrayLength', 'linearOne'] as const;

const curveModulatorModuleImplementation = implementModule({
  _kind: 'curve-modulator-module',
  defaultValues: {
    curve: [],
    cycleLengthMode: 'arrayLength',
    modulationAngle: 0,
    fixedOffset: 0,
  },

  provideNodes: (params, moduleId, defaultValues) => {
    const inputMarkerId = createInternalId(moduleId, 'input-marker');
    const fromInput = (key: keyof NodeInputsDeclared<'curve-modulator-module'>) => ({
      ref: `${inputMarkerId}.${key}`,
    });

    const waveModuleId = 'wave-module';
    const waveModuleFullId = createInternalId(moduleId, waveModuleId);
    const curveModulatorComputeId = createInternalId(moduleId, 'curve-modulator');
    const connectDotsRenderNodeId = createInternalId(moduleId, 'connect-dots');
    const pointRenderModuleId = 'point-render-module';

    const ref = (nodeId: string, port: string) => ({ ref: `${nodeId}.${port}` });

    const result: ModuleExpansionResult<'curve-modulator-module'> = {
      controlNodes: [],

      computeNodes: [
        {
          id: curveModulatorComputeId,
          type: 'curveModulator',
          params: {
            curve: fromInput('curve'),
            modulator: ref(waveModuleFullId, 'sampler'),
            cycleLengthMode: fromInput('cycleLengthMode'),
            modulationAngle: fromInput('modulationAngle'),
            fixedOffset: fromInput('fixedOffset'),
          },
        },
      ],

      renderNodes: [
        {
          id: connectDotsRenderNodeId,
          type: 'connect-dots',
          renderConfig: { layer: 'live', displayByDefault: true, tags: ['path'] },
          params: {
            colorPointsArray: ref(curveModulatorComputeId, 'points'),
            lineWidth: { v: 1 },
            mode: { v: 'catmull-rom' },
          },
        },
      ],

      moduleNodes: [
        {
          id: waveModuleId,
          type: 'wave-module',
          params: {
            frequency: { v: 1 },
            amplitude: { v: 0.5 },
            phase: { v: 0 },
            waveShape: { v: 'sine' },
            samplerTemporalImpact: { v: 0 },
          },
        },
        {
          id: pointRenderModuleId,
          type: 'point-render-module',
          params: {
            points: ref(curveModulatorComputeId, 'points'),
          },
        },
      ],

      inputMarkerNode: {
        id: inputMarkerId,
        type: 'module-input-marker',
        params: createInputMarkerParams(params, defaultValues),
        renderControl: (markerParams, set) => (
          <ModulePanel moduleName="Curve Modulator" moduleId={moduleId} data-testid={`${inputMarkerId}-controls`}>
            {renderIfNeeded(markerParams, 'cycleLengthMode', set, (v, onChange) => (
              <DropdownControl id={`${inputMarkerId}-cycle-length-mode`} label="Cycle length mode" options={CYCLE_LENGTH_MODES} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'modulationAngle', set, (v, onChange) => (
              <KnobControl label="Modulation angle" min={0} max={1} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'fixedOffset', set, (v, onChange) => (
              <KnobControl label="Fixed offset" min={0} max={1} initialValue={v} onChange={onChange} />
            ))}
          </ModulePanel>
        ),
      },

      outputMarkerNode: {
        id: moduleId,
        type: 'module-output-marker',
        params: {},
        outputRefs: {
          points: ref(curveModulatorComputeId, 'points'),
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

export default curveModulatorModuleImplementation;
