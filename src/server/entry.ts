import { renderShell } from './renderShell';
import { renderAlgorithmResponse } from './renderAlgorithmMedia';
import type { Env } from './env';

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/' || url.pathname === '/index.html') {
      return renderShell(request, env);
    }

    if (url.pathname.startsWith('/render/')) {
      return renderAlgorithmResponse(request, {
        renders: env.RENDERS,
        waitUntil: promise => ctx.waitUntil(promise),
      });
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
