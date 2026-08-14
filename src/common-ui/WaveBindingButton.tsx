import { useState } from 'react';
import { WaveformPreview } from './WaveformPreview';

type WaveOption = {
  id: string;
  name: string;
  signalFn: (t: number) => number;
  cycleLength: number;
};

type Props = {
  boundWaveId: string | null;
  availableWaves: WaveOption[];
  onBind: (waveId: string) => void;
  onUnbind: () => void;
};

export function WaveBindingButton({ boundWaveId, availableWaves, onBind, onUnbind }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const boundWave = boundWaveId != null
    ? availableWaves.find(w => w.id === boundWaveId) ?? null
    : null;

  function togglePicker() {
    setPickerOpen(open => !open);
  }

  function handleBind(waveId: string) {
    onBind(waveId);
    setPickerOpen(false);
  }

  return (
    <div>
      {boundWave == null ? (
        <button data-testid="wave-bind-btn" onClick={togglePicker}>
          Bind wave
        </button>
      ) : (
        <div>
          <span
            style={{ cursor: 'pointer' }}
            onClick={togglePicker}
          >
            {boundWave.name}
            <WaveformPreview
              signalFn={boundWave.signalFn}
              cycleLength={boundWave.cycleLength}
              width={60}
              height={24}
            />
          </span>
          <button data-testid="wave-unbind-btn" onClick={onUnbind}>
            ×
          </button>
        </div>
      )}
      {pickerOpen && (
        <div data-testid="wave-picker">
          {availableWaves.map(wave => (
            <div
              key={wave.id}
              data-testid={`wave-option-${wave.id}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleBind(wave.id)}
            >
              {wave.name}
              <WaveformPreview
                signalFn={wave.signalFn}
                cycleLength={wave.cycleLength}
                width={60}
                height={24}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
