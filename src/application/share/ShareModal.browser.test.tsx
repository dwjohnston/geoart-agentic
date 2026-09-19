import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { ShareModal } from './ShareModal';
import { decodeGraphFromUrl } from '../../common-tooling/graphUrlEncoding';
import minimalGraph from '../../algorithms/reference/minimal/minimalThreeNodeReferenceGraph';
import colorShiftOrbitGraph from '../../algorithms/reference/canonical/colorShiftOrbitReferenceGraph';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';

const graph: GeoArtGraph = { ...minimalGraph, previewSettings: { staticImageNumTicks: 2 } };
/** Draws on the paint layer, so its preview changes with the tick count. */
const paintingGraph: GeoArtGraph = { ...colorShiftOrbitGraph, previewSettings: { staticImageNumTicks: 2 } };

const shareOrigin = { origin: 'https://example.test', pathname: '/' };

function renderModal(download: (blob: Blob, filename: string) => void = () => {}, g: GeoArtGraph = graph) {
  return render(<ShareModal graph={g} renderSize={100} onClose={() => {}} download={download} shareOrigin={shareOrigin} />);
}

async function linkValue(): Promise<string> {
  return ((await page.getByLabelText('Share link').element()) as HTMLInputElement).value;
}

function decodeLink(url: string): GeoArtGraph {
  return decodeGraphFromUrl(new URL(url).searchParams.get('a')!) as GeoArtGraph;
}

async function previewSrc(): Promise<string> {
  const img = page.getByRole('img', { name: 'Share preview' });
  await expect.element(img).toBeInTheDocument();
  return ((await img.element()) as HTMLImageElement).src;
}

test('shows the link with the graph\'s tick setting baked in', async () => {
  await renderModal();

  const url = await linkValue();
  expect(url.startsWith('https://example.test/?a=')).toBe(true);
  expect(decodeLink(url).previewSettings?.staticImageNumTicks).toBe(2);
});

test('renders a preview image and re-renders it when the tick count changes', async () => {
  await renderModal(undefined, paintingGraph);

  const before = await previewSrc();
  expect(before.startsWith('data:image/png')).toBe(true);

  await page.getByRole('spinbutton', { name: 'Ticks before image value' }).fill('40');

  await vi.waitFor(async () => expect(await previewSrc()).not.toBe(before));
});

test('tick controls update the link and clamp to the server maximum', async () => {
  await renderModal();

  const ticks = page.getByRole('spinbutton', { name: 'Ticks before image value' });
  await expect.element(ticks).toHaveValue(2);
  await ticks.fill('7');

  await expect.element(page.getByRole('slider', { name: 'Ticks before image' })).toHaveValue('7');
  await vi.waitFor(async () => expect(decodeLink(await linkValue()).previewSettings?.staticImageNumTicks).toBe(7));

  await ticks.fill('9999');
  await expect.element(ticks).toHaveValue(600);
});

test('copy button writes the link to the clipboard', async () => {
  const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
  await renderModal();

  await page.getByRole('button', { name: 'Copy link' }).click();

  await expect.element(page.getByRole('button', { name: 'Copied!' })).toBeInTheDocument();
  expect(writeText).toHaveBeenCalledWith(await linkValue());
  writeText.mockRestore();
});

test('Download PNG saves a PNG named after the graph title', async () => {
  const download = vi.fn();
  await renderModal(download);

  await page.getByRole('button', { name: 'Download PNG' }).click();

  await vi.waitFor(() => expect(download).toHaveBeenCalledTimes(1), { timeout: 10_000 });
  const [blob, filename] = download.mock.calls[0] as [Blob, string];
  expect(blob.type).toBe('image/png');
  expect(filename).toBe('minimal-three-node.png');
  await expect.element(page.getByRole('status')).toHaveTextContent('Saved minimal-three-node.png');
});

test('shows an error status when a download fails', async () => {
  const download = vi.fn(() => {
    throw new Error('disk full');
  });
  await renderModal(download);

  await page.getByRole('button', { name: 'Download PNG' }).click();

  await expect.element(page.getByRole('status')).toHaveTextContent('Download failed: disk full');
});
