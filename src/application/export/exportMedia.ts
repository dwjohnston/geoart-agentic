import { encodeGif } from '../../common-tooling/gifEncoding';
import type { RgbaFrame } from '../../common-tooling/gifEncoding';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import type { ResolvedPreviewSettings } from '../../schema/previewSettings';
import { createOffscreenRenderer } from './offscreenRenderer';

export type ExportFormat = 'png' | 'gif' | 'video';

export type ExportProgress = { frame: number; totalFrames: number };

export type ExportOptions = {
  graph: GeoArtGraph;
  settings: ResolvedPreviewSettings;
  /** The app's canvas size — the graph is rendered at this size. */
  renderSize: number;
  /** Output width/height in pixels. */
  outputSize: number;
  onProgress?: (progress: ExportProgress) => void;
};

export type ExportResult = { blob: Blob; extension: string };

/** Runs the graph for `staticImageNumTicks` ticks and encodes the composited frame as PNG. */
export async function exportPng(options: ExportOptions): Promise<ExportResult> {
  const renderer = createOffscreenRenderer(options.graph, options.renderSize, options.outputSize);
  for (let i = 0; i < options.settings.staticImageNumTicks; i++) renderer.tick();
  const blob = await canvasToBlob(renderer.composite(), 'image/png');
  return { blob, extension: 'png' };
}

/**
 * Captures `animationNumFrames` frames, `animationTicksPerFrame` ticks apart,
 * and encodes them as a looping GIF. Yields to the event loop between
 * frames so progress can be shown.
 */
export async function exportGif(options: ExportOptions): Promise<ExportResult> {
  const { settings } = options;
  const renderer = createOffscreenRenderer(options.graph, options.renderSize, options.outputSize);
  const frames: RgbaFrame[] = [];
  for (let frame = 0; frame < settings.animationNumFrames; frame++) {
    for (let t = 0; t < settings.animationTicksPerFrame; t++) renderer.tick();
    frames.push(renderer.readFrame());
    options.onProgress?.({ frame: frame + 1, totalFrames: settings.animationNumFrames });
    await yieldToEventLoop();
  }
  const bytes = encodeGif(frames, { frameDelayMs: settings.animationFrameDelayMs });
  // Same `new Uint8Array(bytes)` copy as the server route: the TS DOM lib's
  // BlobPart wants a view over a plain ArrayBuffer, not ArrayBufferLike.
  return { blob: new Blob([new Uint8Array(bytes)], { type: 'image/gif' }), extension: 'gif' };
}

/**
 * Records `animationNumFrames` frames through MediaRecorder on a captured
 * canvas stream. MediaRecorder stamps frames with wall-clock time, so frames
 * are drawn `animationFrameDelayMs` apart in real time — the export takes as
 * long as the resulting clip.
 */
export async function exportVideo(options: ExportOptions): Promise<ExportResult> {
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('Video export is not supported in this browser');
  }
  const { settings } = options;
  const renderer = createOffscreenRenderer(options.graph, options.renderSize, options.outputSize);
  const canvas = renderer.composite();
  const mimeType = pickVideoMimeType();
  const stream = canvas.captureStream();
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: Blob[] = [];
  recorder.ondataavailable = e => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  const stopped = new Promise<void>((resolve, reject) => {
    recorder.onstop = () => resolve();
    recorder.onerror = () => reject(new Error('MediaRecorder failed'));
  });

  recorder.start();
  try {
    for (let frame = 0; frame < settings.animationNumFrames; frame++) {
      for (let t = 0; t < settings.animationTicksPerFrame; t++) renderer.tick();
      renderer.composite();
      requestStreamFrame(stream);
      options.onProgress?.({ frame: frame + 1, totalFrames: settings.animationNumFrames });
      await sleep(settings.animationFrameDelayMs);
    }
  } finally {
    recorder.stop();
    stream.getTracks().forEach(track => track.stop());
  }
  await stopped;

  const type = recorder.mimeType || mimeType || 'video/webm';
  return { blob: new Blob(chunks, { type }), extension: type.includes('mp4') ? 'mp4' : 'webm' };
}

/** Prefers WebM (Chromium/Firefox), falls back to MP4 (Safari), else the browser default. */
function pickVideoMimeType(): string | undefined {
  const candidates = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'];
  return candidates.find(c => MediaRecorder.isTypeSupported(c));
}

/**
 * Asks a canvas capture track to emit the current frame now rather than on
 * its own schedule. `requestFrame` is Chromium/Firefox-only, so it is a
 * best-effort nudge; without it the track still samples the canvas on change.
 */
function requestStreamFrame(stream: MediaStream): void {
  for (const track of stream.getVideoTracks()) {
    const maybeCanvasTrack = track as MediaStreamTrack & { requestFrame?: () => void };
    maybeCanvasTrack.requestFrame?.();
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('canvas.toBlob returned null'))), type);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function yieldToEventLoop(): Promise<void> {
  return sleep(0);
}
