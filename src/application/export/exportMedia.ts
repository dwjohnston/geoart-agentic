import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import type { ResolvedPreviewSettings } from '../../schema/previewSettings';
import { createOffscreenRenderer } from './offscreenRenderer';

export type ExportOptions = {
  graph: GeoArtGraph;
  settings: ResolvedPreviewSettings;
  /** The app's canvas size — the graph is rendered at this size. */
  renderSize: number;
  /** Output width/height in pixels. */
  outputSize: number;
};

export type ExportResult = { blob: Blob; extension: string };

/** Runs the graph for `staticImageNumTicks` ticks and encodes the composited frame as PNG. */
export async function exportPng(options: ExportOptions): Promise<ExportResult> {
  const renderer = createOffscreenRenderer(options.graph, options.renderSize, options.outputSize);
  for (let i = 0; i < options.settings.staticImageNumTicks; i++) renderer.tick();
  const blob = await canvasToBlob(renderer.composite(), 'image/png');
  return { blob, extension: 'png' };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('canvas.toBlob returned null'))), type);
  });
}
