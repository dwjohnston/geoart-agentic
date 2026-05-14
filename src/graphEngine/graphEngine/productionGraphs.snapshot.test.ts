import { GRAPHS } from "../../algorithms"
import { describe, expect, test } from 'bun:test';
import { createFakeContext } from "../../common-tooling/test-tooling/fakeContext"
import { createGraphEngine } from "./graphEngine";


describe("All production graphs", () => {
    test.each(GRAPHS)("$id runs without error", (v) => {


        if (v.id === "lfoPlanets") {
            return
        }
        const orbitCtx = createFakeContext();
        const trailCtx = createFakeContext();

        const engine = createGraphEngine(orbitCtx, trailCtx, 100);
        engine.load(v.graph);

        engine.tick();
        engine.tick();
        engine.tick();


        expect(orbitCtx.getCalls()).toMatchSnapshot();
        expect(trailCtx.getCalls()).toMatchSnapshot();

    })
})