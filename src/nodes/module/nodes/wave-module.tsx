import { implementModule } from '../implementModule';
import { createInternalId, createInputMarkerParams, renderIfNeeded } from '../moduleUtils';
import type { ModuleExpansionResult } from '../../../graphEngine/externalInterfaces/ModuleImplementation';
import type { NodeInputsDeclared } from '../../../schema/typeHelpers';
import { KnobControl } from '../../../ui/KnobControl';
import { DropdownControl } from '../../control/ui/DropdownControl';

const WAVE_TYPES = ['sine', 'square', 'triangle', 'saw', 'reverse-saw'] as const;

const waveModuleImplementation = implementModule({
  _kind: 'wave-module',
  defaultValues: {
    frequency: 1,
    amplitude: 0.5,
    phase: 0,
    waveShape: 'sine',
    samplerTemporalImpact: 0,
    fmWaveShape: 'sine',
    fmFrequency: 1,
    fmAmount: 0,
    fmTemporalImpact: 0,
    amWaveShape: 'sine',
    amFrequency: 1,
    amAmount: 0,
    amTemporalImpact: 0,
  },

  provideNodes: (params, moduleId, defaultValues) => {
    const inputMarkerId = createInternalId(moduleId, 'input-marker');
    const fromInput = (key: keyof NodeInputsDeclared<'wave-module'>) => ({
      ref: `${inputMarkerId}.${key}`,
    });

    const timeId = createInternalId(moduleId, 'time');
    const fmWaveId = createInternalId(moduleId, 'fm-wave');
    const amWaveId = createInternalId(moduleId, 'am-wave');
    const primaryWaveId = createInternalId(moduleId, 'primary-wave');

    const ref = (nodeId: string, port: string) => ({ ref: `${nodeId}.${port}` });

    const result: ModuleExpansionResult<'wave-module'> = {
      controlNodes: [],

      computeNodes: [
        {
          id: timeId,
          type: 'time',
          params: {},
        },
        {
          id: fmWaveId,
          type: 'wave',
          params: {
            time: ref(timeId, 'time'),
            waveType: fromInput('fmWaveShape'),
            frequency: fromInput('fmFrequency'),
            amplitude: fromInput('fmAmount'),
            samplerTemporalImpact: fromInput('fmTemporalImpact'),
          },
        },
        {
          id: amWaveId,
          type: 'wave',
          params: {
            time: ref(timeId, 'time'),
            waveType: fromInput('amWaveShape'),
            frequency: fromInput('amFrequency'),
            amplitude: fromInput('amAmount'),
            samplerTemporalImpact: fromInput('amTemporalImpact'),
          },
        },
        {
          id: primaryWaveId,
          type: 'wave',
          params: {
            time: ref(timeId, 'time'),
            waveType: fromInput('waveShape'),
            frequency: fromInput('frequency'),
            amplitude: fromInput('amplitude'),
            phase: fromInput('phase'),
            samplerTemporalImpact: fromInput('samplerTemporalImpact'),
            frequencyModulator: ref(fmWaveId, 'sampler'),
            amplitudeModulator: ref(amWaveId, 'sampler'),
          },
        },
      ],

      renderNodes: [],

      inputMarkerNode: {
        id: inputMarkerId,
        type: 'module-input-marker',
        params: createInputMarkerParams(params, defaultValues),
        renderControl: (markerParams, set) => (
          <div data-testid={`${inputMarkerId}-controls`}>
            {renderIfNeeded(markerParams, 'frequency', set, (v, onChange) => (
              <KnobControl label="Frequency" min={0.01} max={20} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'amplitude', set, (v, onChange) => (
              <KnobControl label="Amplitude" min={0} max={2} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'phase', set, (v, onChange) => (
              <KnobControl label="Phase" min={0} max={1} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'waveShape', set, (v, onChange) => (
              <DropdownControl id={`${inputMarkerId}-wave-shape`} label="Wave shape" options={WAVE_TYPES} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'samplerTemporalImpact', set, (v, onChange) => (
              <KnobControl label="Temporal impact" min={0} max={1} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'fmWaveShape', set, (v, onChange) => (
              <DropdownControl id={`${inputMarkerId}-fm-wave-shape`} label="FM shape" options={WAVE_TYPES} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'fmFrequency', set, (v, onChange) => (
              <KnobControl label="FM freq" min={0.01} max={20} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'fmAmount', set, (v, onChange) => (
              <KnobControl label="FM amount" min={0} max={10} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'fmTemporalImpact', set, (v, onChange) => (
              <KnobControl label="FM temporal" min={0} max={1} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'amWaveShape', set, (v, onChange) => (
              <DropdownControl id={`${inputMarkerId}-am-wave-shape`} label="AM shape" options={WAVE_TYPES} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'amFrequency', set, (v, onChange) => (
              <KnobControl label="AM freq" min={0.01} max={20} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'amAmount', set, (v, onChange) => (
              <KnobControl label="AM amount" min={0} max={1} initialValue={v} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'amTemporalImpact', set, (v, onChange) => (
              <KnobControl label="AM temporal" min={0} max={1} initialValue={v} onChange={onChange} />
            ))}
          </div>
        ),
      },

      outputMarkerNode: {
        id: moduleId,
        type: 'module-output-marker',
        params: {},
        outputRefs: {
          value: ref(primaryWaveId, 'value'),
          sampler: ref(primaryWaveId, 'sampler'),
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

export default waveModuleImplementation;
