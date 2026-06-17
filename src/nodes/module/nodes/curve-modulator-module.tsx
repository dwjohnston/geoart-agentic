import { implementModule } from '../implementModule';
import { createInternalId, createInputMarkerParams, renderIfNeeded } from '../moduleUtils';
import type { ModuleExpansionResult } from '../../../graphEngine/externalInterfaces/ModuleImplementation';
import type { NodeInputsDeclared } from '../../../schema/typeHelpers';
import { KnobControl } from '../../../ui/KnobControl';
import { ModulePanel } from '../../../ui/ModulePanel';
import { DropdownControl } from '../../control/ui/DropdownControl';

const CYCLE_LENGTH_MODES = ['arrayLength', 'linearOne', 'linearTotal'] as const;
const WAVE_TYPES = ['sine', 'square', 'triangle', 'saw', 'reverse-saw'] as const;

const curveModulatorModuleImplementation = implementModule({
  _kind: 'curve-modulator-module',
  defaultValues: {
    curve: [],
    cycleLengthMode: 'arrayLength',
    modulationAngle: 0,
    fixedOffset: 0,
    frequency: 1,
    amplitude: 0.5,
    phase: 0,
    waveShape: 'sine',
    samplerTemporalImpact: 0,
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
            frequency: fromInput('frequency'),
            amplitude: fromInput('amplitude'),
            phase: fromInput('phase'),
            waveShape: fromInput('waveShape'),
            samplerTemporalImpact: fromInput('samplerTemporalImpact'),
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
              <KnobControl label="Modulation angle" min={0} max={1} snapTo={0.25} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'fixedOffset', set, (v, onChange) => (
              <KnobControl label="Fixed offset" min={0} max={1} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'waveShape', set, (v, onChange) => (
              <DropdownControl id={`${inputMarkerId}-wave-shape`} label="Wave shape" options={WAVE_TYPES} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'frequency', set, (v, onChange) => (
              <KnobControl label="Frequency" min={0.01} max={20} step={0.01} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'amplitude', set, (v, onChange) => (
              <KnobControl label="Amplitude" min={0} max={2} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'phase', set, (v, onChange) => (
              <KnobControl label="Phase" min={0} max={1} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'samplerTemporalImpact', set, (v, onChange) => (
              <KnobControl label="Temporal impact" min={0} max={0.1} step={0.001} initialValue={v} onChange={onChange} />
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
