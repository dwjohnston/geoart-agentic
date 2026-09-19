import { useId, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Modal } from '../Modal';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import { PREVIEW_SETTINGS_LIMITS, resolvePreviewSettings } from '../../schema/previewSettings';
import type { ResolvedPreviewSettings } from '../../schema/previewSettings';
import { exportGif, exportPng, exportVideo } from '../export/exportMedia';
import type { ExportFormat, ExportOptions, ExportProgress, ExportResult } from '../export/exportMedia';
import { downloadBlob, exportFilename } from '../export/downloadBlob';
import { gifShareUrl, staticImageShareUrl } from './shareLinks';
import type { ShareOrigin } from './shareLinks';

type Props = {
  graph: GeoArtGraph;
  /** The app's canvas size; downloads render the graph at this size. */
  renderSize: number;
  onClose: () => void;
  /** Overridable for tests; defaults to a real browser download. */
  download?: (blob: Blob, filename: string) => void;
  /** Overridable for tests; defaults to the current page's origin and path. */
  shareOrigin?: ShareOrigin;
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
  png: 'PNG',
  gif: 'GIF',
  video: 'video',
};

type SettingKey = keyof ResolvedPreviewSettings;
type SettingField = { key: SettingKey; label: string; min: number; max: number };

/** Maxima match what the server will render, so a link never asks for more than it gets. */
const STATIC_FIELDS: SettingField[] = [
  { key: 'staticImageNumTicks', label: 'Ticks before image', min: 1, max: PREVIEW_SETTINGS_LIMITS.maxStaticTicks },
];

const GIF_FIELDS: SettingField[] = [
  { key: 'animationNumFrames', label: 'Frames', min: 1, max: PREVIEW_SETTINGS_LIMITS.maxAnimationFrames },
  { key: 'animationTicksPerFrame', label: 'Ticks per frame', min: 1, max: PREVIEW_SETTINGS_LIMITS.maxTicksPerFrame },
  { key: 'animationFrameDelayMs', label: 'Frame delay (ms)', min: 10, max: 500 },
];

type Side = 'static' | 'gif';

function currentShareOrigin(): ShareOrigin {
  return { origin: window.location.origin, pathname: window.location.pathname };
}

/**
 * One modal, two sides: a link to the app (whose `og:image` is the static
 * image after N ticks) and a direct link to the server-rendered GIF. The
 * controls on each side are baked into that side's link, so the server
 * renders what was chosen here. Downloads use the client-side renderer.
 */
export function ShareModal({ graph, renderSize, onClose, download = downloadBlob, shareOrigin }: Props) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [copied, setCopied] = useState<Side | null>(null);
  const [settings, setSettings] = useState<ResolvedPreviewSettings>(() => resolvePreviewSettings(graph));
  const origin = shareOrigin ?? currentShareOrigin();
  const staticUrl = staticImageShareUrl(graph, settings, origin);
  const gifUrl = gifShareUrl(graph, settings, origin);
  const animationSeconds = (settings.animationNumFrames * settings.animationFrameDelayMs) / 1000;
  const working = status.kind === 'working';

  function setSetting(key: SettingKey, value: number) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  async function copy(side: Side, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(side);
      setTimeout(() => setCopied(current => (current === side ? null : current)), 2000);
    } catch {
      // clipboard access may be unavailable in some contexts; the link is still selectable
    }
  }

  async function run(format: ExportFormat) {
    setStatus({ kind: 'working', format, progress: null });
    try {
      // Animated downloads are half size, matching the server's GIF and keeping files small.
      const outputSize = format === 'png' ? renderSize : renderSize / 2;
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

  function fields(list: SettingField[]) {
    return list.map(field => (
      <SliderField
        key={field.key}
        label={field.label}
        min={field.min}
        max={field.max}
        value={settings[field.key]}
        disabled={working}
        onChange={value => setSetting(field.key, value)}
      />
    ));
  }

  return (
    <Modal title="Share" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, color: '#ccc', fontSize: 13 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <Pane title="Share as static image" description="Link to this page; previews show the image after the chosen number of ticks.">
            {fields(STATIC_FIELDS)}
            <LinkRow label="Static image link" url={staticUrl} copied={copied === 'static'} onCopy={() => copy('static', staticUrl)} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => run('png')} disabled={working} style={buttonStyle(working)}>
                Download PNG
              </button>
            </div>
          </Pane>
          <Pane title="Share as GIF" description="Direct link to a looping GIF, for sites like Reddit that preview GIFs.">
            {fields(GIF_FIELDS)}
            <div>
              {settings.animationNumFrames} frames × {settings.animationFrameDelayMs} ms ({animationSeconds.toFixed(1)} s)
            </div>
            <LinkRow label="GIF link" url={gifUrl} copied={copied === 'gif'} onCopy={() => copy('gif', gifUrl)} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => run('gif')} disabled={working} style={buttonStyle(working)}>
                Download GIF
              </button>
              <button onClick={() => run('video')} disabled={working} style={buttonStyle(working)}>
                Download video
              </button>
            </div>
          </Pane>
        </div>
        <div role="status" style={{ minHeight: 18 }}>
          {statusText(status)}
        </div>
      </div>
    </Modal>
  );
}

function Pane({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
      <h3 style={{ margin: 0, fontSize: 15, color: '#eee' }}>{title}</h3>
      <div style={{ color: '#999' }}>{description}</div>
      {children}
    </section>
  );
}

type LinkRowProps = { label: string; url: string; copied: boolean; onCopy: () => void };

function LinkRow({ label, url, copied, onCopy }: LinkRowProps) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        readOnly
        aria-label={label}
        value={url}
        onFocus={e => e.target.select()}
        style={{
          flex: 1,
          minWidth: 0,
          background: '#111',
          color: '#aef',
          border: '1px solid #333',
          borderRadius: 4,
          padding: '6px 8px',
          fontFamily: 'monospace',
          fontSize: 12,
        }}
      />
      <button onClick={onCopy} style={{ ...buttonStyle(false), flex: 'none', color: copied ? '#5af' : '#eee' }}>
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
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

/** Horizontal slider with a number box beside it for exact entry. */
function SliderField({ label, min, max, value, disabled, onChange }: SliderFieldProps) {
  const id = useId();
  const commit = (raw: string) => {
    const n = Math.round(Number(raw));
    if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)));
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
        value={value}
        disabled={disabled}
        onChange={e => commit(e.target.value)}
      />
      <input
        type="number"
        aria-label={`${label} value`}
        min={min}
        max={max}
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
        ? `Rendering ${FORMAT_LABELS[status.format]}… frame ${status.progress.frame} / ${status.progress.totalFrames}`
        : `Rendering ${FORMAT_LABELS[status.format]}…`;
    case 'done':
      return `Saved ${status.filename}`;
    case 'error':
      return `Download failed: ${status.message}`;
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
