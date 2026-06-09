import { implementModule } from '../implementModule';
import { createInternalId, createInputMarkerParams, renderIfNeeded } from '../moduleUtils';
import type { ModuleExpansionResult } from '../../../graphEngine/externalInterfaces/ModuleImplementation';
import type { NodeInputsDeclared } from '../../../schema/typeHelpers';
import { KnobControl } from '../../../ui/KnobControl';

const waveModuleImplementation = implementModule({
  _kind: 'wave-module',
  defaultValues: {
    frequency: 1,
    amplitude: 0.5,
    phase: 0,
  },

  provideNodes: (params, moduleId, defaultValues) => {
    const inputMarkerId = createInternalId(moduleId, 'input-marker');
    const fromInput = (key: keyof NodeInputsDeclared<'wave-module'>) => ({
      ref: `${inputMarkerId}.${key}`,
    });

    // Internal control node IDs
    const waveShapeId = createInternalId(moduleId, 'wave-shape');
    const samplerTemporalImpactId = createInternalId(moduleId, 'sampler-temporal-impact');
    const fmWaveShapeId = createInternalId(moduleId, 'fm-wave-shape');
    const fmFrequencyId = createInternalId(moduleId, 'fm-frequency');
    const fmAmountId = createInternalId(moduleId, 'fm-amount');
    const fmTemporalImpactId = createInternalId(moduleId, 'fm-temporal-impact');
    const amWaveShapeId = createInternalId(moduleId, 'am-wave-shape');
    const amFrequencyId = createInternalId(moduleId, 'am-frequency');
    const amAmountId = createInternalId(moduleId, 'am-amount');
    const amTemporalImpactId = createInternalId(moduleId, 'am-temporal-impact');

    // Internal compute node IDs
    const timeId = createInternalId(moduleId, 'time');
    const fmWaveId = createInternalId(moduleId, 'fm-wave');
    const amWaveId = createInternalId(moduleId, 'am-wave');
    const primaryWaveId = createInternalId(moduleId, 'primary-wave');

    const ref = (nodeId: string, port: string) => ({ ref: `${nodeId}.${port}` });

    const result: ModuleExpansionResult<'wave-module'> = {
      controlNodes: [
        {
          id: waveShapeId,
          type: 'waveSelector',
          params: {
            label: { v: 'Wave shape' },
            value: { v: 'sine' },
          },
        },
        {
          id: samplerTemporalImpactId,
          type: 'slider',
          params: {
            label: { v: 'Temporal impact' },
            min: { v: 0 },
            max: { v: 1 },
            step: { v: 0.01 },
            value: { v: 0 },
          },
        },
        {
          id: fmWaveShapeId,
          type: 'waveSelector',
          params: {
            label: { v: 'FM wave shape' },
            value: { v: 'sine' },
          },
        },
        {
          id: fmFrequencyId,
          type: 'slider',
          params: {
            label: { v: 'FM freq' },
            min: { v: 0.01 },
            max: { v: 20 },
            step: { v: 0.01 },
            value: { v: 1 },
          },
        },
        {
          id: fmAmountId,
          type: 'slider',
          params: {
            label: { v: 'FM amount' },
            min: { v: 0 },
            max: { v: 10 },
            step: { v: 0.01 },
            value: { v: 0 },
          },
        },
        {
          id: fmTemporalImpactId,
          type: 'slider',
          params: {
            label: { v: 'FM temporal impact' },
            min: { v: 0 },
            max: { v: 1 },
            step: { v: 0.01 },
            value: { v: 0 },
          },
        },
        {
          id: amWaveShapeId,
          type: 'waveSelector',
          params: {
            label: { v: 'AM wave shape' },
            value: { v: 'sine' },
          },
        },
        {
          id: amFrequencyId,
          type: 'slider',
          params: {
            label: { v: 'AM freq' },
            min: { v: 0.01 },
            max: { v: 20 },
            step: { v: 0.01 },
            value: { v: 1 },
          },
        },
        {
          id: amAmountId,
          type: 'slider',
          params: {
            label: { v: 'AM amount' },
            min: { v: 0 },
            max: { v: 1 },
            step: { v: 0.01 },
            value: { v: 0 },
          },
        },
        {
          id: amTemporalImpactId,
          type: 'slider',
          params: {
            label: { v: 'AM temporal impact' },
            min: { v: 0 },
            max: { v: 1 },
            step: { v: 0.01 },
            value: { v: 0 },
          },
        },
      ],

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
            waveType: ref(fmWaveShapeId, 'value'),
            frequency: ref(fmFrequencyId, 'value'),
            amplitude: ref(fmAmountId, 'value'),
            samplerTemporalImpact: ref(fmTemporalImpactId, 'value'),
          },
        },
        {
          id: amWaveId,
          type: 'wave',
          params: {
            time: ref(timeId, 'time'),
            waveType: ref(amWaveShapeId, 'value'),
            frequency: ref(amFrequencyId, 'value'),
            amplitude: ref(amAmountId, 'value'),
            samplerTemporalImpact: ref(amTemporalImpactId, 'value'),
          },
        },
        {
          id: primaryWaveId,
          type: 'wave',
          params: {
            time: ref(timeId, 'time'),
            waveType: ref(waveShapeId, 'value'),
            frequency: fromInput('frequency'),
            amplitude: fromInput('amplitude'),
            phase: fromInput('phase'),
            samplerTemporalImpact: ref(samplerTemporalImpactId, 'value'),
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
            {renderIfNeeded(markerParams, 'frequency', set, (initialValue, onChange) => (
              <KnobControl label="Frequency" min={0.01} max={20} initialValue={initialValue} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'amplitude', set, (initialValue, onChange) => (
              <KnobControl label="Amplitude" min={0} max={2} initialValue={initialValue} onChange={onChange} />
            ))}
            {renderIfNeeded(markerParams, 'phase', set, (initialValue, onChange) => (
              <KnobControl label="Phase" min={0} max={1} initialValue={initialValue} onChange={onChange} />
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
