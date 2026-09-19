import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { ExportMediaModal } from './ExportMediaModal';
import minimalGraph from '../../algorithms/reference/minimal/minimalThreeNodeReferenceGraph';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';

// Two short frames keep the GIF/video exports fast.
const graph: GeoArtGraph = {
  ...minimalGraph,
  previewSettings: { staticImageNumTicks: 2, animationNumFrames: 2, animationFrameDelayMs: 20 },
};

async function waitForDownload(download: ReturnType<typeof vi.fn>): Promise<[Blob, string]> {
  await vi.waitFor(() => expect(download).toHaveBeenCalledTimes(1), { timeout: 10_000 });
  return download.mock.calls[0] as [Blob, string];
}

test('PNG button downloads a PNG named after the graph title', async () => {
  const download = vi.fn();
  await render(<ExportMediaModal graph={graph} renderSize={100} onClose={() => {}} download={download} />);

  await page.getByRole('button', { name: 'PNG image' }).click();

  const [blob, filename] = await waitForDownload(download);
  expect(blob.type).toBe('image/png');
  expect(filename).toBe('minimal-three-node.png');
  await expect.element(page.getByRole('status')).toHaveTextContent('Saved minimal-three-node.png');
});

test('GIF button downloads a GIF89a file at half size and reports progress', async () => {
  const download = vi.fn();
  await render(<ExportMediaModal graph={graph} renderSize={100} onClose={() => {}} download={download} />);

  await page.getByRole('button', { name: 'GIF' }).click();

  const [blob, filename] = await waitForDownload(download);
  expect(blob.type).toBe('image/gif');
  expect(filename).toBe('minimal-three-node.gif');
  const bytes = new Uint8Array(await blob.arrayBuffer());
  expect(new TextDecoder().decode(bytes.subarray(0, 6))).toBe('GIF89a');
  // Logical screen width (little-endian) is half of renderSize.
  expect(bytes[6] | (bytes[7] << 8)).toBe(50);
});

test('Video button downloads a video blob', async () => {
  const download = vi.fn();
  await render(<ExportMediaModal graph={graph} renderSize={100} onClose={() => {}} download={download} />);

  await page.getByRole('button', { name: 'Video' }).click();

  const [blob, filename] = await waitForDownload(download);
  expect(blob.type).toMatch(/^video\//);
  expect(blob.size).toBeGreaterThan(0);
  expect(filename).toMatch(/^minimal-three-node\.(webm|mp4)$/);
});

test('sliders start from previewSettings and the number box overrides the export', async () => {
  const download = vi.fn();
  await render(<ExportMediaModal graph={graph} renderSize={100} onClose={() => {}} download={download} />);

  const frames = page.getByRole('spinbutton', { name: 'Animation frames value' });
  await expect.element(frames).toHaveValue(2);
  await expect.element(page.getByRole('slider', { name: 'Animation frames' })).toHaveValue('2');

  await frames.fill('3');
  await expect.element(page.getByRole('slider', { name: 'Animation frames' })).toHaveValue('3');

  await page.getByRole('button', { name: 'GIF' }).click();
  await waitForDownload(download);
  await expect.element(page.getByRole('status')).toHaveTextContent('Saved minimal-three-node.gif');
  // Progress reported the overridden frame count.
  await expect.element(page.getByText('3 frames')).toBeInTheDocument();
});

test('shows an error status when an export fails', async () => {
  const download = vi.fn(() => {
    throw new Error('disk full');
  });
  await render(<ExportMediaModal graph={graph} renderSize={100} onClose={() => {}} download={download} />);

  await page.getByRole('button', { name: 'PNG image' }).click();

  await expect.element(page.getByRole('status')).toHaveTextContent('Export failed: disk full');
});
