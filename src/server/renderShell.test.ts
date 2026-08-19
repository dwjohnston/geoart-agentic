import { describe, expect, test } from 'bun:test';
import { renderShell, type Env } from './renderShell';

const FAKE_INDEX_HTML = '<!doctype html><html><head><title>x</title></head><body></body></html>';

function fakeEnv(): Env {
  return {
    ASSETS: {
      fetch: async () =>
        new Response(FAKE_INDEX_HTML, { status: 200, headers: { 'content-type': 'text/html' } }),
    } as unknown as Fetcher,
  };
}

describe('renderShell', () => {
  test('omits og:image when ?a= is absent', async () => {
    const response = await renderShell(new Request('https://example.com/'), fakeEnv());
    const html = await response.text();
    expect(html).not.toContain('og:image');
  });

  test('adds og:image pointing at render/<raw value> when ?a= is present', async () => {
    const response = await renderShell(new Request('https://example.com/?a=YWJj'), fakeEnv());
    const html = await response.text();
    expect(html).toContain('<meta property="og:image" content="render/YWJj" />');
  });
});
