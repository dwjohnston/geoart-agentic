import { CANVAS_SIZE } from './renderAlgorithmImage';

export interface Env {
  ASSETS: Fetcher;
}

const DEFAULT_TITLE = 'Geoart 3000';
const DEFAULT_DESCRIPTION =
  'A generative art engine — graphs of connected nodes evaluated each frame to produce animations.';

/**
 * Renders the static HTML shell for a request: title, description, and OG
 * tags. The canvas/graph itself stays entirely client-side — this only
 * decorates the document `<head>` server-side, so crawlers and link
 * previews see meaningful content before the client bundle hydrates.
 *
 * Future "image path" work will fetch a saved artwork's graph data here
 * (by request path/id) and substitute per-artwork title/description/OG
 * tags instead of the defaults below.
 */
export async function renderShell(request: Request, env: Env): Promise<Response> {
  const assetResponse = await env.ASSETS.fetch(new URL('/index.html', request.url));
  if (!assetResponse.ok) {
    return assetResponse;
  }

  const html = await assetResponse.text();
  const requestUrl = new URL(request.url);
  const algorithmParam = requestUrl.searchParams.get('a');
  const decorated = decorateHead(html, {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    imagePath: algorithmParam ? new URL(`/render/${algorithmParam}`, requestUrl).toString() : undefined,
  });

  return new Response(decorated, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

function decorateHead(
  html: string,
  meta: { title: string; description: string; imagePath?: string },
): string {
  const metaTags = [
    `<meta name="description" content="${Bun.escapeHTML(meta.description)}" />`,
    `<meta property="og:title" content="${Bun.escapeHTML(meta.title)}" />`,
    `<meta property="og:description" content="${Bun.escapeHTML(meta.description)}" />`,
    `<meta property="og:type" content="website" />`,
    ...(meta.imagePath
      ? [
        `<meta property="og:image" content="${Bun.escapeHTML(meta.imagePath)}" />`,
        `<meta property="og:image:width" content="${CANVAS_SIZE}" />`,
        `<meta property="og:image:height" content="${CANVAS_SIZE}" />`,
      ]
      : []),
  ].join('\n    ');

  return html
    .replace(/<title>.*?<\/title>/, `<title>${Bun.escapeHTML(meta.title)}</title>`)
    .replace('</head>', `    ${metaTags}\n  </head>`);
}
