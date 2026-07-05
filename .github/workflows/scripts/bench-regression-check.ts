import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";
import { cleanEnv, str } from "envalid";
import { run } from "mitata";
import { registerPerformanceBenchmarks } from "../../../scripts/lib/loadPerformanceBenchmarks";

/**
 * Compares this run's benchmark numbers (measured on the CI runner - the
 * only environment allowed to define "canonical" numbers, since a
 * developer's laptop has different hardware/noise) against the committed
 * baseline in scripts/bench-baseline.json.
 *
 * - Regression beyond REGRESSION_THRESHOLD: fails, unless the PR carries the
 *   OVERRIDE_LABEL, in which case the freshly-measured numbers are accepted
 *   as the new baseline and committed back to the PR branch.
 * - Improvement beyond IMPROVEMENT_THRESHOLD: never fails, and always
 *   ratchets the baseline forward - nothing is blocked by getting faster.
 * - Within NOISE_BAND: no action, to avoid baseline drift from run-to-run
 *   jitter.
 */

const env = cleanEnv(process.env, {
  GITHUB_REPOSITORY: str({ default: "" }),
  GH_TOKEN: str({ default: "" }),
  PR_NUMBER: str({ default: "" }),
  GITHUB_SHA: str({ default: "" }),
});

const REGRESSION_THRESHOLD = 0.15;
const IMPROVEMENT_THRESHOLD = 0.1;
const OVERRIDE_LABEL = "perf-override";

const BASELINE_PATH = resolve(import.meta.dir, "../../../scripts/bench-baseline.json");
const REPORT_PATH = resolve(import.meta.dir, "bench-report.md");

interface BaselineEntry {
  p75: number;
  avg: number;
  recordedAt: string;
  sha: string;
}
type Baseline = Record<string, BaselineEntry>;

type Status = "NEW" | "OK" | "REGRESSED" | "IMPROVED";

interface ComparisonRow {
  name: string;
  status: Status;
  currentP75: number;
  currentAvg: number;
  baselineP75?: number;
  deltaPct?: number;
}

function loadBaseline(): Baseline {
  try {
    return JSON.parse(readFileSync(BASELINE_PATH, "utf-8")) as Baseline;
  } catch {
    return {};
  }
}

function classify(current: number, baseline: number | undefined): { status: Status; deltaPct?: number } {
  if (baseline === undefined) return { status: "NEW" };
  const deltaPct = (current - baseline) / baseline;
  if (deltaPct > REGRESSION_THRESHOLD) return { status: "REGRESSED", deltaPct };
  if (deltaPct < -IMPROVEMENT_THRESHOLD) return { status: "IMPROVED", deltaPct };
  return { status: "OK", deltaPct };
}

function hasOverrideLabel(): boolean {
  if (!env.PR_NUMBER || !env.GH_TOKEN || !env.GITHUB_REPOSITORY) return false;
  try {
    const out = execSync(
      `gh pr view "${env.PR_NUMBER}" --repo "${env.GITHUB_REPOSITORY}" --json labels`,
      { env: { ...process.env, GH_TOKEN: env.GH_TOKEN }, encoding: "utf-8" },
    );
    const { labels } = JSON.parse(out) as { labels: { name: string }[] };
    return labels.some((l) => l.name === OVERRIDE_LABEL);
  } catch {
    return false;
  }
}

function formatDelta(deltaPct: number | undefined): string {
  if (deltaPct === undefined) return "—";
  const sign = deltaPct > 0 ? "+" : "";
  return `${sign}${(deltaPct * 100).toFixed(1)}%`;
}

function statusEmoji(status: Status): string {
  switch (status) {
    case "REGRESSED":
      return "🔴";
    case "IMPROVED":
      return "🟢";
    case "NEW":
      return "🆕";
    case "OK":
      return "⚪";
  }
}

function buildReport(rows: ComparisonRow[], anyRegressed: boolean, overridden: boolean): string {
  const lines = ["### Benchmark report", ""];
  lines.push("| Benchmark | Status | p75 (ms) | Baseline p75 (ms) | Δ |");
  lines.push("|---|---|---|---|---|");
  for (const row of rows) {
    lines.push(
      `| ${row.name} | ${statusEmoji(row.status)} ${row.status} | ${row.currentP75.toFixed(2)} | ${row.baselineP75?.toFixed(2) ?? "—"} | ${formatDelta(row.deltaPct)} |`,
    );
  }
  lines.push("");
  if (overridden) {
    lines.push(`Regression accepted via the \`${OVERRIDE_LABEL}\` label — baseline updated from this CI run.`);
  } else if (anyRegressed) {
    lines.push(
      `One or more benchmarks regressed by more than ${REGRESSION_THRESHOLD * 100}%. ` +
        `Add the \`${OVERRIDE_LABEL}\` label to this PR to accept these numbers as the new baseline.`,
    );
  } else {
    lines.push("No significant regressions.");
  }
  return lines.join("\n");
}

function postComment(body: string): void {
  writeFileSync(REPORT_PATH, body);
  console.log(body);

  if (!env.PR_NUMBER || !env.GH_TOKEN || !env.GITHUB_REPOSITORY) {
    console.log("(no PR context - skipping PR comment)");
    return;
  }

  try {
    execSync(
      `gh pr comment "${env.PR_NUMBER}" --repo "${env.GITHUB_REPOSITORY}" --body-file "${REPORT_PATH}"`,
      { env: { ...process.env, GH_TOKEN: env.GH_TOKEN }, stdio: "inherit" },
    );
  } catch (err) {
    console.error("Failed to post GitHub comment:", err);
  }
}

function commitUpdatedBaseline(baseline: Baseline): void {
  if (!env.GH_TOKEN) {
    console.log("(no GH_TOKEN - skipping baseline commit)");
    return;
  }

  writeFileSync(BASELINE_PATH, `${JSON.stringify(baseline, null, 2)}\n`);

  try {
    execSync(`git config user.name "github-actions[bot]"`, { stdio: "inherit" });
    execSync(`git config user.email "github-actions[bot]@users.noreply.github.com"`, { stdio: "inherit" });
    execSync(`git add "${BASELINE_PATH}"`, { stdio: "inherit" });
    execSync(`git commit -m "chore: update bench baseline [skip ci]"`, { stdio: "inherit" });
    execSync(`git push`, { stdio: "inherit" });
  } catch (err) {
    console.error("Failed to commit updated baseline:", err);
  }
}

async function main() {
  registerPerformanceBenchmarks();
  const { benchmarks } = await run({ print: () => undefined });

  const baseline = loadBaseline();
  const updatedBaseline: Baseline = { ...baseline };
  const rows: ComparisonRow[] = [];
  let anyRegressed = false;
  let anyImproved = false;
  let anyNew = false;

  const recordedAt = new Date().toISOString();

  for (const trial of benchmarks) {
    const name = trial.alias;
    const stats = trial.runs[0]?.stats;
    if (!stats) continue;

    // mitata reports stats in nanoseconds; store/compare in milliseconds.
    const p75Ms = stats.p75 / 1e6;
    const avgMs = stats.avg / 1e6;

    const { status, deltaPct } = classify(p75Ms, baseline[name]?.p75);
    rows.push({
      name,
      status,
      currentP75: p75Ms,
      currentAvg: avgMs,
      baselineP75: baseline[name]?.p75,
      deltaPct,
    });

    if (status === "REGRESSED") anyRegressed = true;
    if (status === "IMPROVED") anyImproved = true;
    if (status === "NEW") anyNew = true;

    if (status === "NEW" || status === "IMPROVED") {
      updatedBaseline[name] = { p75: p75Ms, avg: avgMs, recordedAt, sha: env.GITHUB_SHA };
    }
  }

  const overridden = anyRegressed && hasOverrideLabel();
  if (overridden) {
    for (const row of rows) {
      if (row.status === "REGRESSED") {
        updatedBaseline[row.name] = { p75: row.currentP75, avg: row.currentAvg, recordedAt, sha: env.GITHUB_SHA };
      }
    }
  }

  if (anyImproved || anyNew || overridden) {
    commitUpdatedBaseline(updatedBaseline);
  }

  postComment(buildReport(rows, anyRegressed, overridden));

  if (anyRegressed && !overridden) {
    process.exit(1);
  }
}

await main();
