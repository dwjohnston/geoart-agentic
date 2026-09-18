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

const CHECK_RUN_NAME = "Workers Builds: geoart-agentic";
const PREVIEW_BOT_LOGIN = "cloudflare-workers-and-pages[bot]";
const DEPLOY_TIMEOUT_MS = 15 * 60 * 1000;
const POLL_INTERVAL_MS = 20 * 1000;
const REQUEST_ATTEMPTS = 5;

async function ghApi<T>(path: string): Promise<T> {
  return $`gh api ${path}`.env({ ...process.env, GH_TOKEN: env.GH_TOKEN }).json() as Promise<T>;
}

type CheckRun = { name: string; status: string; conclusion: string | null; details_url: string };
type Comment = { user: { login: string }; body: string };

async function waitForCloudflareDeploy(): Promise<void> {
  const deadline = Date.now() + DEPLOY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const { check_runs } = await ghApi<{ check_runs: CheckRun[] }>(
      `repos/${env.GITHUB_REPOSITORY}/commits/${env.GITHUB_SHA}/check-runs?per_page=100`,
    );
    const run = check_runs.find((r) => r.name === CHECK_RUN_NAME);
    if (run?.status === "completed") {
      if (run.conclusion !== "success") {
        throw new Error(`${CHECK_RUN_NAME} finished with "${run.conclusion}": ${run.details_url}`);
      }
      console.log(`${CHECK_RUN_NAME} succeeded`);
      return;
    }
    console.log(`Waiting for ${CHECK_RUN_NAME} (${run?.status ?? "not yet reported"})…`);
    await Bun.sleep(POLL_INTERVAL_MS);
  }
  throw new Error(`Timed out waiting for ${CHECK_RUN_NAME}`);
}

/**
 * The bot edits one comment per PR; its "Latest Commit" column must match
 * this SHA before the Commit Preview URL can be trusted.
 */
async function findPreviewUrl(): Promise<string> {
  const shortSha = env.GITHUB_SHA.slice(0, 8);
  const deadline = Date.now() + DEPLOY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const comments = await ghApi<Comment[]>(
      `repos/${env.GITHUB_REPOSITORY}/issues/${env.PR_NUMBER}/comments?per_page=100`,
    );
    const body = comments.find((c) => c.user.login === PREVIEW_BOT_LOGIN)?.body;
    const match = body?.match(/\|\s*([0-9a-f]{8})\s*\|\s*<a href='([^']+)'>Commit Preview URL<\/a>/);
    if (match && match[1] === shortSha) {
      return match[2];
    }
    console.log(`Preview comment not yet updated for ${shortSha}…`);
    await Bun.sleep(POLL_INTERVAL_MS);
  }
  throw new Error(`No Commit Preview URL found for ${shortSha} in PR #${env.PR_NUMBER}`);
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

await waitForCloudflareDeploy();
const base = await findPreviewUrl();
console.log(`Smoke-testing ${base}`);

await expectRoute(base, "/", { status: 200, contentType: "text/html", bodyIncludes: "<html" });
await expectRoute(base, `/render/${encodeGraphForUrl(testGraph)}`, { status: 200, contentType: "image/png" });
await expectRoute(base, "/render/not-a-valid-encoded-graph!!", { status: 404 });
console.log("Preview smoke test passed");
