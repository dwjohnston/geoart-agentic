import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Modal } from '../Modal';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import { resolvePreviewSettings } from '../../schema/previewSettings';
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

export function ExportMediaModal({ graph, renderSize, onClose, download = downloadBlob }: Props) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [halfSize, setHalfSize] = useState(true);
  const settings = resolvePreviewSettings(graph);
  const animationSeconds = (settings.animationNumFrames * settings.animationFrameDelayMs) / 1000;

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
        <div>
          Image: {settings.staticImageNumTicks} ticks. Animation: {settings.animationNumFrames} frames ×{' '}
          {settings.animationFrameDelayMs} ms ({animationSeconds.toFixed(1)} s). Set{' '}
          <code>previewSettings</code> on the algorithm to change these.
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
