import * as fs from "fs";
import * as path from "path";
import { describe, expect, it } from 'bun:test';
import { createFakeContext } from "../../common-tooling/test-tooling/fakeContext";
import { createGraphEngine } from "./graphEngine";
import type { GeoArtGraph } from "../../schema/_generated/schema-types";

const CANVAS_SIZE = 800;


/**
 * We look at all the reference graphs at <root>/algorithms/reference/*
 * 
 * And run snapshot tests on all of them.
 */
const BASE_DIR = path.join(__dirname, "../..", "algorithms", "reference");

const subfolders = fs
    .readdirSync(BASE_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

for (const folder of subfolders) {
    const folderPath = path.join(BASE_DIR, folder);

    const cases = fs
        .readdirSync(folderPath)
        .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
        .map((file) => {

            // We really do need a sync import here
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const mod = require(path.join(folderPath, file));

            const exportsLength = Object.values(mod).length;
            if (exportsLength !== 1) {
                throw new Error(`Expected only 1 export from '${folder}/${file} but got ${exportsLength}`)
            }
            const exportedItem = Object.values(mod)[0]; // grab the single named export
            return [file, exportedItem] as const;
        });

    describe(folder, () => {
        it.each(cases)("u%s", (_fileName, graph) => {
            // your assertions here
            const liveCtx = createFakeContext();
            const paintCtx = createFakeContext();

            const engine = createGraphEngine(liveCtx, paintCtx, CANVAS_SIZE);
            engine.load(graph as GeoArtGraph);

            engine.tick();
            engine.tick();
            engine.tick();

            expect(liveCtx.getCalls()).toMatchSnapshot();
            expect(paintCtx.getCalls()).toMatchSnapshot();
        });
    });
}