import { describe, expect, it } from "bun:test";
import { AlgorithmBuilder } from "./builder";
import { validateGeoArtGraph } from "./validateGeoArtGraph";

describe(AlgorithmBuilder, () => {
    it("Builds a minimal graph", () => {

        const result = new AlgorithmBuilder().construct();

        expect(validateGeoArtGraph(result)).toBe(true)
    })

});
