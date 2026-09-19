import { useId, useState } from 'react';
import type { CSSProperties } from 'react';
import { Modal } from '../Modal';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import { resolvePreviewSettings } from '../../schema/previewSettings';
import type { ResolvedPreviewSettings } from '../../schema/previewSettings';
import { exportGif, exportPng, exportVideo } from './exportMedia';
import type { ExportFormat, ExportOptions, ExportProgress, ExportResult } from './exportMedia';
import { downloadBlob, exportFilename } from './downloadBlob';

type Props = {
  graph: GeoArtGraph;
  /** The app's canvas size; the graph is rendered at this size. */
  renderSize: number;
  onClose: () => void;
  /** Overridable for tests; defaults to a real browser download. */
  download?: (blob: Blob, filename: string) => void;
};

type Status =
  | { kind: 'idle' }
  | { kind: 'working'; format: ExportFormat; progress: ExportProgress | null }
  | { kind: 'done'; filename: string }
  | { kind: 'error'; message: string };

const EXPORTERS: Record<ExportFormat, (options: ExportOptions) => Promise<ExportResult>> = {
  png: exportPng,
  gif: exportGif,
  video: exportVideo,
};

const FORMAT_LABELS: Record<ExportFormat, string> = {
  png: 'PNG image',
  gif: 'GIF',
  video: 'Video',
};

type SettingKey = keyof ResolvedPreviewSettings;

/** Slider range per setting; the text box accepts any value ≥ min so larger exports are still possible. */
const SETTING_FIELDS: { key: SettingKey; label: string; min: number; max: number }[] = [
  { key: 'staticImageNumTicks', label: 'Image ticks', min: 1, max: 200 },
  { key: 'animationNumFrames', label: 'Animation frames', min: 1, max: 300 },
  { key: 'animationTicksPerFrame', label: 'Ticks per frame', min: 1, max: 20 },
  { key: 'animationFrameDelayMs', label: 'Frame delay (ms)', min: 10, max: 500 },
];

export function ExportMediaModal({ graph, renderSize, onClose, download = downloadBlob }: Props) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [halfSize, setHalfSize] = useState(true);
  const [settings, setSettings] = useState<ResolvedPreviewSettings>(() => resolvePreviewSettings(graph));
  const animationSeconds = (settings.animationNumFrames * settings.animationFrameDelayMs) / 1000;

  function setSetting(key: SettingKey, value: number) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  async function run(format: ExportFormat) {
    setStatus({ kind: 'working', format, progress: null });
    try {
      const outputSize = format !== 'png' && halfSize ? renderSize / 2 : renderSize;
      const result = await EXPORTERS[format]({
        graph,
        settings,
        renderSize,
        outputSize,
        onProgress: progress => setStatus({ kind: 'working', format, progress }),
      });
      const filename = exportFilename(graph.title, result.extension);
      download(result.blob, filename);
      setStatus({ kind: 'done', filename });
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
    }
  }

  const working = status.kind === 'working';

  return (
    <Modal title="Export media" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: '#ccc', fontSize: 13 }}>
        {SETTING_FIELDS.map(field => (
          <SliderField
            key={field.key}
            label={field.label}
            min={field.min}
            max={field.max}
            value={settings[field.key]}
            disabled={working}
            onChange={value => setSetting(field.key, value)}
          />
        ))}
        <div>
          Animation: {settings.animationNumFrames} frames × {settings.animationFrameDelayMs} ms (
          {animationSeconds.toFixed(1)} s). Defaults come from <code>previewSettings</code> on the algorithm.
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={halfSize} onChange={e => setHalfSize(e.target.checked)} disabled={working} />
          Half-size GIF / video ({renderSize / 2}px) — smaller files for sharing
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {(Object.keys(EXPORTERS) as ExportFormat[]).map(format => (
            <button key={format} onClick={() => run(format)} disabled={working} style={buttonStyle(working)}>
              {FORMAT_LABELS[format]}
            </button>
          ))}
        </div>
        <div role="status" style={{ minHeight: 18 }}>
          {statusText(status)}
        </div>
      </div>
    </Modal>
  );
}

type SliderFieldProps = {
  label: string;
  min: number;
  max: number;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
};

/** Horizontal slider with a number box beside it for exact entry (the box may exceed the slider's max). */
function SliderField({ label, min, max, value, disabled, onChange }: SliderFieldProps) {
  const id = useId();
  const commit = (raw: string) => {
    const n = Math.round(Number(raw));
    if (Number.isFinite(n)) onChange(Math.max(min, n));
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 64px', alignItems: 'center', gap: 8 }}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={Math.min(value, max)}
        disabled={disabled}
        onChange={e => commit(e.target.value)}
      />
      <input
        type="number"
        aria-label={`${label} value`}
        min={min}
        step={1}
        value={value}
        disabled={disabled}
        onChange={e => commit(e.target.value)}
        style={{ width: '100%', background: '#1e1e2a', color: '#eee', border: '1px solid #444', borderRadius: 4, padding: '2px 4px', fontSize: 13 }}
      />
    </div>
  );
}

function statusText(status: Status): string {
  switch (status.kind) {
    case 'idle':
      return '';
    case 'working':
      return status.progress
        ? `Exporting ${FORMAT_LABELS[status.format]}… frame ${status.progress.frame} / ${status.progress.totalFrames}`
        : `Exporting ${FORMAT_LABELS[status.format]}…`;
    case 'done':
      return `Saved ${status.filename}`;
    case 'error':
      return `Export failed: ${status.message}`;
  }
}

function buttonStyle(disabled: boolean): CSSProperties {
  return {
    flex: 1,
    background: '#2a2a3a',
    color: '#eee',
    border: '1px solid #444',
    borderRadius: 4,
    padding: '6px 14px',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    fontSize: 13,
  };
}
