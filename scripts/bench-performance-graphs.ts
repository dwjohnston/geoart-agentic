import { run } from "mitata";
import { registerPerformanceBenchmarks } from "./lib/loadPerformanceBenchmarks";

/**
 * Benchmarks every reference graph under algorithms/reference/performance/*.
 *
 * These graphs are picked deliberately to be expensive (large point counts,
 * cartesian-product-style module fan-out) so they double as a regression
 * benchmark: optimize the engine/nodes, re-run, and compare against a
 * baseline `bun run bench` from before the change.
 *
 * Note: these graphs are deliberately excluded from
 * allReferenceGraphs.snapshot.test.ts (their draw-call trace is too large to
 * snapshot sanely) - their regression coverage comes from the bench
 * baseline check below instead, not from a correctness snapshot.
 *
 * CI runs these same benchmarks against a committed baseline
 * (scripts/bench-baseline.json) via .github/workflows/scripts/bench-regression-check.ts
 * - see that file for the regression-check logic.
 */

registerPerformanceBenchmarks();

await run();
