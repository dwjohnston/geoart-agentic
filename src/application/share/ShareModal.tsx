import { useEffect, useId, useState } from 'react';
import type { CSSProperties } from 'react';
import { Modal } from '../Modal';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import { PREVIEW_SETTINGS_LIMITS, resolvePreviewSettings } from '../../schema/previewSettings';
import { exportPng } from '../export/exportMedia';
import { createOffscreenRenderer } from '../export/offscreenRenderer';
import { downloadBlob, exportFilename } from '../export/downloadBlob';
import { staticImageShareUrl } from './shareLinks';
import type { ShareOrigin } from './shareLinks';

type Props = {
  graph: GeoArtGraph;
  /** The app's canvas size; the preview and download render the graph at this size. */
  renderSize: number;
  onClose: () => void;
  /** Overridable for tests; defaults to a real browser download. */
  download?: (blob: Blob, filename: string) => void;
  /** Overridable for tests; defaults to the current page's origin and path. */
  shareOrigin?: ShareOrigin;
};

type Status =
  | { kind: 'idle' }
  | { kind: 'working' }
  | { kind: 'done'; filename: string }
  | { kind: 'error'; message: string };

const PREVIEW_SIZE = 320;
/** Wait for the slider to settle before re-rendering the preview. */
const PREVIEW_DEBOUNCE_MS = 150;

function currentShareOrigin(): ShareOrigin {
  return { origin: window.location.origin, pathname: window.location.pathname };
}

/**
 * Share link to the app with the graph in `?a=`. The server's `og:image` for
 * that page is the graph rendered after `staticImageNumTicks`, so the tick
 * control is baked into the link and the preview shows the same frame.
 */
export function ShareModal({ graph, renderSize, onClose, download = downloadBlob, shareOrigin }: Props) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [copied, setCopied] = useState(false);
  const [numTicks, setNumTicks] = useState(() => resolvePreviewSettings(graph).staticImageNumTicks);
  const preview = usePreviewImage(graph, renderSize, numTicks);
  const origin = shareOrigin ?? currentShareOrigin();
  const url = staticImageShareUrl(graph, { staticImageNumTicks: numTicks }, origin);
  const working = status.kind === 'working';

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access may be unavailable in some contexts; the link is still selectable
    }
  }

  async function downloadPng() {
    setStatus({ kind: 'working' });
    try {
      const result = await exportPng({
        graph,
        settings: { ...resolvePreviewSettings(graph), staticImageNumTicks: numTicks },
        renderSize,
        outputSize: renderSize,
      });
      const filename = exportFilename(graph.title, result.extension);
      download(result.blob, filename);
      setStatus({ kind: 'done', filename });
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
    }
  }

  return (
    <Modal title="Share" onClose={onClose}>
      <div style={{ display: 'flex', gap: 24, color: '#ccc', fontSize: 13 }}>
        <div
          style={{
            width: PREVIEW_SIZE,
            height: PREVIEW_SIZE,
            flex: 'none',
            background: '#0a0a0f',
            border: '1px solid #333',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
          }}
        >
          {preview ? (
            <img src={preview} alt="Share preview" width={PREVIEW_SIZE} height={PREVIEW_SIZE} style={{ display: 'block' }} />
          ) : (
            'Rendering preview…'
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{ color: '#999' }}>Link previews show the image after the chosen number of ticks.</div>
          <SliderField
            label="Ticks before image"
            min={1}
            max={PREVIEW_SETTINGS_LIMITS.maxStaticTicks}
            value={numTicks}
            disabled={working}
            onChange={setNumTicks}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              readOnly
              aria-label="Share link"
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
            <button onClick={copy} style={{ ...buttonStyle(false), flex: 'none', color: copied ? '#5af' : '#eee' }}>
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
          <button onClick={downloadPng} disabled={working} style={{ ...buttonStyle(working), alignSelf: 'flex-start' }}>
            Download PNG
          </button>
          <div role="status" style={{ minHeight: 18 }}>
            {statusText(status)}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Data URL of the graph after `numTicks`, re-rendered (debounced) when the
 * inputs change. `null` while a render is pending — the last image is
 * remembered with the tick count it was rendered for, so it is only shown
 * while that count is still current.
 */
function usePreviewImage(graph: GeoArtGraph, renderSize: number, numTicks: number): string | null {
  const [preview, setPreview] = useState<{ numTicks: number; src: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const renderer = createOffscreenRenderer(graph, renderSize, PREVIEW_SIZE);
      for (let i = 0; i < numTicks; i++) renderer.tick();
      setPreview({ numTicks, src: renderer.composite().toDataURL('image/png') });
    }, PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [graph, renderSize, numTicks]);

  return preview?.numTicks === numTicks ? preview.src : null;
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
      return 'Rendering PNG…';
    case 'done':
      return `Saved ${status.filename}`;
    case 'error':
      return `Download failed: ${status.message}`;
  }
}

function buttonStyle(disabled: boolean): CSSProperties {
  return {
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
