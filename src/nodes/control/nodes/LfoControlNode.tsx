import { defineControlNode } from '../types';
import { LfoControl } from '../ui/LfoControl';
const WAVE_TYPES = ["sine", "square", "triangle", "saw", "reverse-saw"] as const

export const lfoControlNodeDef = defineControlNode('lfo-control', {
  defaults: {
    baseValue: { v: 0 },
    frequency: { v: 0.5 },
    amplitude: { v: 0 },
    waveShape: { v: 'sine' },
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
        onWaveShapeChange={v => set('waveShape', { v: v as "sine" | "square" | "saw" | "reverse-saw" | "triangle" })}
      />
    );
  },
});
