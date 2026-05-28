import { KnobControl } from '../../../ui/KnobControl';
import { DropdownControl } from './DropdownControl';
import { DebugPanel } from '../../../ui-tooling/DebugPanel';
import type { ResolvedValue } from '../../../schema/typeHelpers';




type Props = {
  id: string;
  baseValue: number;
  frequency: number;
  amplitude: number;
  waveShape: ResolvedValue<"waveTypeEnumValue">;
  waveShapeOptions: readonly ResolvedValue<"waveTypeEnumValue">[];
  onBaseValueChange: (v: number) => void;
  onFrequencyChange: (v: number) => void;
  onAmplitudeChange: (v: number) => void;
  onWaveShapeChange: (v: ResolvedValue<"waveTypeEnumValue">) => void;
};

export function LfoControl({
  id,
  baseValue,
  frequency,
  amplitude,
  waveShape,
  waveShapeOptions,
  onBaseValueChange,
  onFrequencyChange,
  onAmplitudeChange,
  onWaveShapeChange,
}: Props) {
  return (
    <div
      className="lfo-control"
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8 }}
    >
      {/* Large base knob */}
      <KnobControl
        initialValue={baseValue}
        min={-1}
        max={1}
        size="lg"
        label="base"
        onChange={onBaseValueChange}
      />

      {/* Right column: wave shape dropdown + two small knobs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <DebugPanel value={{ waveShape, waveShapeOptions }} />
        <DropdownControl
          id={`${id}-waveShape`}
          label=""
          options={waveShapeOptions}
          initialValue={waveShape}
          onChange={onWaveShapeChange}
        />
        <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
          <KnobControl
            initialValue={frequency}
            min={0.001}
            max={1}
            size="sm"
            label="freq"
            onChange={onFrequencyChange}
          />
          <KnobControl
            initialValue={amplitude}
            min={0}
            max={1}
            size="sm"
            label="amp"
            onChange={onAmplitudeChange}
          />
        </div>
      </div>
    </div>
  );
}
