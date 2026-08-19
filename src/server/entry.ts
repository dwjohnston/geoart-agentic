import { renderShell, type Env } from './renderShell';
import { renderAlgorithmResponse } from './renderAlgorithmImage';

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/' || url.pathname === '/index.html') {
      return renderShell(request, env);
    }

    if (url.pathname.startsWith('/render/')) {
      return renderAlgorithmResponse(request);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
