import { readdirSync } from "fs";
import { resolve } from "path";
import { bench } from "mitata";
import { createGraphEngine } from "../../src/graphEngine/graphEngine/graphEngine";
import type { GeoArtGraph } from "../../src/schema/_generated/schema-types";

const CANVAS_SIZE = 800;

const root = resolve(import.meta.dir, "../..");
export const PERF_DIR = resolve(root, "src/algorithms/reference/performance");

// A context that discards everything it's given. Unlike the fakeContext used
// in tests, it doesn't record calls into an array - we don't want the
// benchmark harness's own bookkeeping allocations showing up in the GC
// profile of the thing we're actually trying to measure.
function createNoopContext(): CanvasRenderingContext2D {
  return new Proxy({} as CanvasRenderingContext2D, {
    get() {
      return () => undefined;
    },
    set() {
      return true;
    },
  });
}

// Discovers every reference graph under src/algorithms/reference/performance,
// loads each into its own engine, and registers a mitata bench for it.
// Returns the file names registered so callers can compare that list against
// e.g. a stored baseline.
export function registerPerformanceBenchmarks(): string[] {
  const files = readdirSync(PERF_DIR).filter(
    (f) => f.endsWith(".ts") && !f.endsWith(".test.ts"),
  );

  for (const file of files) {
    // We really do need a sync import here to register benches before run().
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require(resolve(PERF_DIR, file));

    const exports = Object.values(mod);
    if (exports.length !== 1) {
      throw new Error(`Expected only 1 export from performance/${file} but got ${exports.length}`);
    }
    const graph = exports[0] as GeoArtGraph;

    const engine = createGraphEngine(createNoopContext(), createNoopContext(), CANVAS_SIZE);
    engine.load(graph);

    bench(file, () => {
      for (let i = 0; i < 100; i++) {
        engine.tick();
      }
    });
  }

  return files;
}
