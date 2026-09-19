import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { ShareModal } from './ShareModal';
import { decodeGraphFromUrl } from '../../common-tooling/graphUrlEncoding';
import minimalGraph from '../../algorithms/reference/minimal/minimalThreeNodeReferenceGraph';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';

// Two short frames keep the GIF/video downloads fast.
const graph: GeoArtGraph = {
  ...minimalGraph,
  previewSettings: { staticImageNumTicks: 2, animationNumFrames: 2, animationFrameDelayMs: 20 },
};

const shareOrigin = { origin: 'https://example.test', pathname: '/' };

function renderModal(download: (blob: Blob, filename: string) => void = () => {}) {
  return render(<ShareModal graph={graph} renderSize={100} onClose={() => {}} download={download} shareOrigin={shareOrigin} />);
}

async function waitForDownload(download: ReturnType<typeof vi.fn>): Promise<[Blob, string]> {
  await vi.waitFor(() => expect(download).toHaveBeenCalledTimes(1), { timeout: 10_000 });
  return download.mock.calls[0] as [Blob, string];
}

function decodeStaticLink(url: string): GeoArtGraph {
  return decodeGraphFromUrl(new URL(url).searchParams.get('a')!) as GeoArtGraph;
}

function decodeGifLink(url: string): GeoArtGraph {
  const { pathname } = new URL(url);
  return decodeGraphFromUrl(pathname.slice('/render/'.length, -'.gif'.length)) as GeoArtGraph;
}

test('shows both sides with a link each', async () => {
  await renderModal();

  await expect.element(page.getByRole('heading', { name: 'Share as static image' })).toBeInTheDocument();
  await expect.element(page.getByRole('heading', { name: 'Share as GIF' })).toBeInTheDocument();

  const staticLink = (await page.getByLabelText('Static image link').element()) as HTMLInputElement;
  expect(staticLink.value.startsWith('https://example.test/?a=')).toBe(true);
  expect(decodeStaticLink(staticLink.value).previewSettings?.staticImageNumTicks).toBe(2);

  const gifLink = (await page.getByLabelText('GIF link').element()) as HTMLInputElement;
  expect(gifLink.value.startsWith('https://example.test/render/')).toBe(true);
  expect(gifLink.value.endsWith('.gif')).toBe(true);
  expect(decodeGifLink(gifLink.value).previewSettings?.animationNumFrames).toBe(2);
});

test('static-image controls update only the static link', async () => {
  await renderModal();
  const gifBefore = ((await page.getByLabelText('GIF link').element()) as HTMLInputElement).value;

  const ticks = page.getByRole('spinbutton', { name: 'Ticks before image value' });
  await expect.element(ticks).toHaveValue(2);
  await ticks.fill('7');

  await expect.element(page.getByRole('slider', { name: 'Ticks before image' })).toHaveValue('7');
  await vi.waitFor(async () => {
    const link = (await page.getByLabelText('Static image link').element()) as HTMLInputElement;
    expect(decodeStaticLink(link.value).previewSettings?.staticImageNumTicks).toBe(7);
  });
  expect(((await page.getByLabelText('GIF link').element()) as HTMLInputElement).value).toBe(gifBefore);
});

test('GIF controls update the GIF link and are clamped to the server maximum', async () => {
  await renderModal();

  const frames = page.getByRole('spinbutton', { name: 'Frames value' });
  await frames.fill('3');
  await expect.element(page.getByRole('slider', { name: 'Frames' })).toHaveValue('3');
  await vi.waitFor(async () => {
    const link = (await page.getByLabelText('GIF link').element()) as HTMLInputElement;
    expect(decodeGifLink(link.value).previewSettings?.animationNumFrames).toBe(3);
  });

  await frames.fill('9999');
  await expect.element(frames).toHaveValue(100);
});

test('copy button writes the link to the clipboard', async () => {
  const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
  await renderModal();

  await page.getByRole('button', { name: 'Copy link' }).nth(1).click();

  await expect.element(page.getByRole('button', { name: 'Copied!' })).toBeInTheDocument();
  expect(writeText).toHaveBeenCalledTimes(1);
  expect(String(writeText.mock.calls[0][0]).endsWith('.gif')).toBe(true);
  writeText.mockRestore();
});

test('Download PNG saves a PNG named after the graph title', async () => {
  const download = vi.fn();
  await renderModal(download);

  await page.getByRole('button', { name: 'Download PNG' }).click();

  const [blob, filename] = await waitForDownload(download);
  expect(blob.type).toBe('image/png');
  expect(filename).toBe('minimal-three-node.png');
  await expect.element(page.getByRole('status')).toHaveTextContent('Saved minimal-three-node.png');
});

test('Download GIF saves a half-size GIF89a file', async () => {
  const download = vi.fn();
  await renderModal(download);

  await page.getByRole('button', { name: 'Download GIF' }).click();

  const [blob, filename] = await waitForDownload(download);
  expect(blob.type).toBe('image/gif');
  expect(filename).toBe('minimal-three-node.gif');
  const bytes = new Uint8Array(await blob.arrayBuffer());
  expect(new TextDecoder().decode(bytes.subarray(0, 6))).toBe('GIF89a');
  // Logical screen width (little-endian) is half of renderSize.
  expect(bytes[6] | (bytes[7] << 8)).toBe(50);
});

test('Download video saves a video blob', async () => {
  const download = vi.fn();
  await renderModal(download);

  await page.getByRole('button', { name: 'Download video' }).click();

  const [blob, filename] = await waitForDownload(download);
  expect(blob.type).toMatch(/^video\//);
  expect(blob.size).toBeGreaterThan(0);
  expect(filename).toMatch(/^minimal-three-node\.(webm|mp4)$/);
});

test('shows an error status when a download fails', async () => {
  const download = vi.fn(() => {
    throw new Error('disk full');
  });
  await renderModal(download);

  await page.getByRole('button', { name: 'Download PNG' }).click();

  await expect.element(page.getByRole('status')).toHaveTextContent('Download failed: disk full');
});
