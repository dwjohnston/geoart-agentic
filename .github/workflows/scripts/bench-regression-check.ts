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
 *   UPDATE_LABEL, in which case the freshly-measured numbers are accepted
 *   as the new baseline.
 * - Improvement beyond IMPROVEMENT_THRESHOLD: never fails - nothing is
 *   blocked by getting faster - but the baseline is only ratcheted forward
 *   when the PR carries the UPDATE_LABEL.
 * - Within the noise band: no action, to avoid baseline drift from run-to-run
 *   jitter.
 *
 * The baseline is never committed automatically: any write back to the PR
 * branch (regression, improvement, or a newly-added benchmark) requires the
 * UPDATE_LABEL to be present on the PR.
 */

const env = cleanEnv(process.env, {
  GITHUB_REPOSITORY: str({ default: "" }),
  GH_TOKEN: str({ default: "" }),
  PR_NUMBER: str({ default: "" }),
  PR_HEAD_SHA: str({ default: "" }),
});

const REGRESSION_THRESHOLD = 0.15;
const IMPROVEMENT_THRESHOLD = 0.1;
const UPDATE_LABEL = "update-benchmark";

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

function hasUpdateLabel(): boolean {
  if (!env.PR_NUMBER || !env.GH_TOKEN || !env.GITHUB_REPOSITORY) return false;
  try {
    const out = execSync(
      `gh pr view "${env.PR_NUMBER}" --repo "${env.GITHUB_REPOSITORY}" --json labels`,
      { env: { ...process.env, GH_TOKEN: env.GH_TOKEN }, encoding: "utf-8" },
    );
    const { labels } = JSON.parse(out) as { labels: { name: string }[] };
    return labels.some((l) => l.name === UPDATE_LABEL);
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

// Hidden marker so later runs can find and update the existing comment
// instead of posting a new one per push.
const REPORT_MARKER = "<!-- bench-report -->";

interface ReportSummary {
  anyRegressed: boolean;
  anyChanged: boolean;
  labelled: boolean;
}

function buildReport(rows: ComparisonRow[], { anyRegressed, anyChanged, labelled }: ReportSummary): string {
  const lines = [REPORT_MARKER, "### Benchmark report", ""];
  lines.push("| Benchmark | Status | p75 (ms) | Baseline p75 (ms) | Δ |");
  lines.push("|---|---|---|---|---|");
  for (const row of rows) {
    lines.push(
      `| ${row.name} | ${statusEmoji(row.status)} ${row.status} | ${row.currentP75.toFixed(2)} | ${row.baselineP75?.toFixed(2) ?? "—"} | ${formatDelta(row.deltaPct)} |`,
    );
  }
  lines.push("");
  if (anyChanged && labelled) {
    lines.push(`Baseline updated from this CI run via the \`${UPDATE_LABEL}\` label.`);
  } else if (anyRegressed) {
    lines.push(
      `One or more benchmarks regressed by more than ${REGRESSION_THRESHOLD * 100}%. ` +
        `Add the \`${UPDATE_LABEL}\` label to this PR to accept these numbers as the new baseline.`,
    );
  } else if (anyChanged) {
    lines.push(
      "No regressions. Some benchmarks improved or are new — " +
        `add the \`${UPDATE_LABEL}\` label to this PR to record these numbers as the new baseline.`,
    );
  } else {
    lines.push("No significant changes.");
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

  const ghEnv = { ...process.env, GH_TOKEN: env.GH_TOKEN };
  try {
    const existingId = findExistingReportCommentId(ghEnv);
    if (existingId !== undefined) {
      execSync(
        `gh api --method PATCH "repos/${env.GITHUB_REPOSITORY}/issues/comments/${existingId}" --raw-field body=@"${REPORT_PATH}"`,
        { env: ghEnv, stdio: "inherit" },
      );
    } else {
      execSync(
        `gh pr comment "${env.PR_NUMBER}" --repo "${env.GITHUB_REPOSITORY}" --body-file "${REPORT_PATH}"`,
        { env: ghEnv, stdio: "inherit" },
      );
    }
  } catch (err) {
    console.error("Failed to post GitHub comment:", err);
  }
}

function findExistingReportCommentId(ghEnv: NodeJS.ProcessEnv): number | undefined {
  const out = execSync(
    `gh api "repos/${env.GITHUB_REPOSITORY}/issues/${env.PR_NUMBER}/comments?per_page=100"`,
    { env: ghEnv, encoding: "utf-8" },
  );
  const comments = JSON.parse(out) as { id: number; body: string }[];
  return comments.find((c) => c.body.includes(REPORT_MARKER))?.id;
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
  const rows: ComparisonRow[] = [];

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
  }

  const anyRegressed = rows.some((row) => row.status === "REGRESSED");
  const anyChanged = rows.some((row) => row.status !== "OK");
  const labelled = anyChanged && hasUpdateLabel();

  // The baseline is only ever written with the label present - whether the
  // change is a regression being accepted, an improvement being ratcheted
  // forward, or a new benchmark being recorded for the first time.
  if (labelled) {
    const recordedAt = new Date().toISOString();
    const updatedBaseline: Baseline = { ...baseline };
    for (const row of rows) {
      if (row.status !== "OK") {
        updatedBaseline[row.name] = { p75: row.currentP75, avg: row.currentAvg, recordedAt, sha: env.PR_HEAD_SHA };
      }
    }
    commitUpdatedBaseline(updatedBaseline);
  }

  postComment(buildReport(rows, { anyRegressed, anyChanged, labelled }));

  if (anyRegressed && !labelled) {
    process.exit(1);
  }
}

await main();
