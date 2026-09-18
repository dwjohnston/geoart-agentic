import { $ } from "bun";
import { cleanEnv, str } from "envalid";
import { encodeGraphForUrl } from "../../../src/common-tooling/graphUrlEncoding";
import { testGraph } from "../../../src/graphEngine/graphEngine/_testGraphs/testGraph";

/**
 * Smoke-tests the Cloudflare Workers preview deployment for a PR.
 *
 * Cloudflare's git integration builds and deploys each PR commit outside of
 * GitHub Actions, and reports "success" as soon as the bundle deploys — a
 * Worker that throws on every request (e.g. one that references a Bun-only
 * global) still deploys "successfully". This script waits for that deploy,
 * then actually requests the routes the Worker serves so a runtime 500 fails
 * the PR.
 */

const env = cleanEnv(process.env, {
  GITHUB_REPOSITORY: str(),
  GH_TOKEN: str(),
  PR_NUMBER: str(),
  GITHUB_SHA: str(),
});

const PREVIEW_BOT_LOGIN = "cloudflare-workers-and-pages[bot]";
const DEPLOY_TIMEOUT_MS = 5 * 60 * 1000;
const POLL_INTERVAL_MS = 5 * 1000;
const REQUEST_ATTEMPTS = 5;

async function ghApi<T>(path: string): Promise<T> {
  return $`gh api ${path}`.env({ ...process.env, GH_TOKEN: env.GH_TOKEN }).json() as Promise<T>;
}

type Comment = { user: { login: string }; body: string };

// One row of the bot comment's table:
// | <status> | <worker name> | <short sha> | <a href='…'>Commit Preview URL</a>… | <updated> |
// The check run Cloudflare also creates is invisible to GITHUB_TOKEN (Actions
// only sees its own check runs), so the comment is the only signal available.
const PREVIEW_ROW = /^\|\s*([^|]*?)\s*\|[^|]*\|\s*([0-9a-f]{8})\s*\|\s*<a href='([^']+)'>Commit Preview URL<\/a>/m;

/**
 * Waits for the Cloudflare bot comment to report a finished deploy of this
 * SHA (the bot edits one comment per PR in place) and returns its preview URL.
 */
async function waitForPreviewUrl(): Promise<string> {
  const shortSha = env.GITHUB_SHA.slice(0, 8);
  const deadline = Date.now() + DEPLOY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const comments = await ghApi<Comment[]>(
      `repos/${env.GITHUB_REPOSITORY}/issues/${env.PR_NUMBER}/comments?per_page=100`,
    );
    const body = comments.find((c) => c.user.login === PREVIEW_BOT_LOGIN)?.body;
    const match = body?.match(PREVIEW_ROW);
    if (match && match[2] === shortSha) {
      const [, status, , url] = match;
      if (status.includes("✅")) {
        console.log(`Cloudflare deploy of ${shortSha} succeeded`);
        return url;
      }
      if (status.includes("❌")) {
        throw new Error(`Cloudflare deploy of ${shortSha} failed: ${status}`);
      }
      console.log(`Cloudflare deploy of ${shortSha} in progress: ${status}`);
    } else {
      console.log(`Waiting for Cloudflare preview comment for ${shortSha}…`);
    }
    await Bun.sleep(POLL_INTERVAL_MS);
  }
  throw new Error(`Timed out waiting for Cloudflare preview of ${shortSha} on PR #${env.PR_NUMBER}`);
}

type Expectation = { status: number; contentType?: string; bodyIncludes?: string };

async function expectRoute(base: string, path: string, expected: Expectation): Promise<void> {
  let lastError = "";
  for (let attempt = 1; attempt <= REQUEST_ATTEMPTS; attempt++) {
    const res = await fetch(new URL(path, base));
    const contentType = res.headers.get("content-type") ?? "";
    const body = expected.bodyIncludes ? await res.text() : "";
    const ok =
      res.status === expected.status &&
      (!expected.contentType || contentType.startsWith(expected.contentType)) &&
      (!expected.bodyIncludes || body.includes(expected.bodyIncludes));
    if (ok) {
      console.log(`OK   ${res.status} ${path}`);
      return;
    }
    lastError = `got ${res.status} ${contentType}`;
    console.log(`Retry ${path}: ${lastError} (attempt ${attempt}/${REQUEST_ATTEMPTS})`);
    await Bun.sleep(3000 * attempt);
  }
  throw new Error(`FAIL ${path}: expected ${expected.status} ${expected.contentType ?? ""}, ${lastError}`);
}

const base = await waitForPreviewUrl();
console.log(`Smoke-testing ${base}`);

await expectRoute(base, "/", { status: 200, contentType: "text/html", bodyIncludes: "<html" });
await expectRoute(base, `/render/${encodeGraphForUrl(testGraph)}`, { status: 200, contentType: "image/png" });
await expectRoute(base, "/render/not-a-valid-encoded-graph!!", { status: 404 });
console.log("Preview smoke test passed");
