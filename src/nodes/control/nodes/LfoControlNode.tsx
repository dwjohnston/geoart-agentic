import { defineControlNode } from '../types';
import { LfoControl } from '../ui/LfoControl';

export const lfoControlNodeDef = defineControlNode('lfo-control', {
  defaults: {
    baseValue: { v: 0 },
    frequency: { v: 0.5 },
    amplitude: { v: 0 },
    waveShape: { v: 'sine' },
    waveShapeOptions: { v: ["sine", "square", "saw", "reverse-saw", "triangle"] as const }
  },
  renderControl(node, set) {
    return (
      <LfoControl
        id={node.id}
        baseValue={node.params.baseValue.v}
        frequency={node.params.frequency.v}
        amplitude={node.params.amplitude.v}
        waveShape={node.params.waveShape.v}
        waveShapeOptions={node.params.waveShapeOptions.v.map(s => s.v)}
        onBaseValueChange={v => set('baseValue', { v })}
        onFrequencyChange={v => set('frequency', { v })}
        onAmplitudeChange={v => set('amplitude', { v })}
        onWaveShapeChange={v => set('waveShape', { v: v as "sine" | "square" | "saw" | "reverse-saw" | "triangle" })}
      />
    );
  },
});
