import type { ResolvedValue } from '../../../schema/typeHelpers';
import { implementControlNode } from '../implementControlNode';
import { LfoControl } from '../ui/LfoControl';
const WAVE_TYPES = ["sine", "square", "triangle", "saw", "reverse-saw"] as Array<ResolvedValue<"waveTypeEnumValue">>;

export const lfoControlNodeDef = implementControlNode('lfo-control', {
  defaults: {
    baseValue: 0,
    frequency: 0.5,
    amplitude: 0,
    waveShape: 'sine'
  },

  renderControl(node, set) {
    return (
      <LfoControl
        id={node.id}
        baseValue={node.params.baseValue.v}
        frequency={node.params.frequency.v}
        amplitude={node.params.amplitude.v}
        waveShape={node.params.waveShape.v}
        waveShapeOptions={WAVE_TYPES}
        onBaseValueChange={v => set('baseValue', { v })}
        onFrequencyChange={v => set('frequency', { v })}
        onAmplitudeChange={v => set('amplitude', { v })}
        onWaveShapeChange={v => set('waveShape', { v: v })}
      />
    );
  },
});
