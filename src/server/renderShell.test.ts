import { describe, expect, test } from 'bun:test';
import { renderShell } from './renderShell';
import type { Env } from './env';

const FAKE_INDEX_HTML = '<!doctype html><html><head><title>x</title></head><body></body></html>';

function fakeEnv(): Env {
  return {
    ASSETS: {
      fetch: async () =>
        new Response(FAKE_INDEX_HTML, { status: 200, headers: { 'content-type': 'text/html' } }),
    } as unknown as Fetcher,
    RENDERS: {} as R2Bucket,
  };
}

describe('renderShell', () => {
  test('omits og:image when ?a= is absent', async () => {
    const response = await renderShell(new Request('https://example.com/'), fakeEnv());
    const html = await response.text();
    expect(html).not.toContain('og:image');
  });

  test('adds og:image as an absolute URL when ?a= is present', async () => {
    const response = await renderShell(new Request('https://example.com/?a=YWJj'), fakeEnv());
    const html = await response.text();
    expect(html).toContain(
      '<meta property="og:image" content="https://example.com/render/YWJj" />',
    );
  });

  test('adds og:image:width/height matching the render canvas size', async () => {
    const response = await renderShell(new Request('https://example.com/?a=YWJj'), fakeEnv());
    const html = await response.text();
    expect(html).toContain('<meta property="og:image:width" content="800" />');
    expect(html).toContain('<meta property="og:image:height" content="800" />');
  });
});
