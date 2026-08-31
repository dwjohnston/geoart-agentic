import { describe, expect, it } from "bun:test";
import { AlgorithmBuilder } from "./builder";
import { graphToBuilderCode } from "./builderCodegen";
import { validateGeoArtGraph } from "./validateGeoArtGraph";
import type { GeoArtGraph, ModuleNode } from "./_generated/schema-types";

/**
 * Executes generated source text (produced by `graphToBuilderCode`) and
 * returns the resulting `GeoArtGraph`. The generated code is trusted
 * test-time output of our own codegen, not runtime user input.
 */
function evalBuilderCode(code: string): GeoArtGraph {
    const fn = new Function("AlgorithmBuilder", `return ${code}`);
    return fn(AlgorithmBuilder) as GeoArtGraph;
}

function sortById<T extends { id: string }>(nodes: T[]): T[] {
    return [...nodes].sort((a, b) => a.id.localeCompare(b.id));
}

function expectRoundTrips(original: GeoArtGraph): { code: string; rebuilt: GeoArtGraph } {
    const code = graphToBuilderCode(original);
    const rebuilt = evalBuilderCode(code);

    expect(validateGeoArtGraph(rebuilt)).toBe(true);

    expect(rebuilt.title).toBe(original.title);
    expect(rebuilt.author).toBe(original.author);
    expect(rebuilt.description).toBe(original.description);

    expect(sortById(rebuilt.control.nodes)).toEqual(sortById(original.control.nodes));
    expect(sortById(rebuilt.compute.nodes)).toEqual(sortById(original.compute.nodes));
    expect(sortById(rebuilt.render.nodes)).toEqual(sortById(original.render.nodes));
    expect(sortById(rebuilt.module?.nodes ?? [])).toEqual(sortById(original.module?.nodes ?? []));

    return { code, rebuilt };
}

describe(graphToBuilderCode, () => {
    it("Minimal empty graph", () => {
        const graph = new AlgorithmBuilder().construct();
        const code = graphToBuilderCode(graph);

        expect(code).toBe("new AlgorithmBuilder().construct();");

        const rebuilt = evalBuilderCode(code);
        expect(validateGeoArtGraph(rebuilt)).toBe(true);
    });

    it("Round-trips a graph with cross-layer refs (control + compute + render)", () => {
        const graph = new AlgorithmBuilder()
            .addControlNode({
                id: "radius",
                type: "slider",
                params: {
                    label: { v: "Radius" },
                    min: { v: 0 },
                    max: { v: 0.5 },
                    step: { v: 0.01 },
                    value: { v: 0.1 },
                },
            })
            .addComputeNode({
                id: "time",
                type: "time",
                params: {},
            })
            .addComputeNode({
                id: "earthOrbit",
                type: "orbit",
                params: {
                    time: { ref: "time.time" },
                    radius: { ref: "radius.value" },
                    speed: { v: 1 },
                },
            })
            .addRenderNode({
                id: "dot",
                type: "circle",
                renderConfig: { layer: "live" },
                params: {
                    radius: { ref: "radius.value" },
                    centerPoints: { ref: "earthOrbit.points" },
                },
            })
            .construct();

        expectRoundTrips(graph);
    });

    it("Preserves title, author, and description", () => {
        const graph = new AlgorithmBuilder({
            title: "My Algorithm",
            author: "Test Author",
            description: "A test description",
        }).construct();

        const { code } = expectRoundTrips(graph);
        expect(code).toContain("'My Algorithm'".replace(/'/g, '"'));
    });

    it("Module node referring to control node", () => {
        const graph = new AlgorithmBuilder()
            .addControlNode({
                id: "speed",
                type: "slider",
                params: {
                    label: { v: "Speed" },
                    min: { v: 0 },
                    max: { v: 5 },
                    value: { v: 1 },
                },
            })
            .addModuleNode({
                id: "myModule",
                type: "orbit-module",
                params: {
                    time: { v: 0 },
                    speed: { ref: "speed.value" },
                    radius: { v: 0.1 },
                    numPoints: { v: 50 },
                },
            })
            .construct();

        expectRoundTrips(graph);
    });

    it("Module node referring to another module node", () => {
        const graph = new AlgorithmBuilder()
            .addModuleNode({
                id: "innerOrbit",
                type: "orbit-module",
                params: {
                    time: { v: 0 },
                    speed: { v: 1 },
                    radius: { v: 0.1 },
                    numPoints: { v: 50 },
                },
            })
            .addModuleNode({
                id: "outerOrbit",
                type: "orbit-module",
                params: {
                    time: { v: 0 },
                    speed: { v: 0.5 },
                    radius: { v: 0.2 },
                    numPoints: { v: 30 },
                    centerPoints: { ref: "innerOrbit.points" },
                },
            })
            .construct();

        expectRoundTrips(graph);
    });

    it("Compute node referring to module node", () => {
        const graph = new AlgorithmBuilder()
            .addModuleNode({
                id: "myModule",
                type: "orbit-module",
                params: {
                    time: { v: 0 },
                    speed: { v: 1 },
                    radius: { v: 0.1 },
                    numPoints: { v: 50 },
                },
            })
            .addComputeNode({
                id: "derived",
                type: "orbit",
                params: {
                    time: { v: 0 },
                    radius: { v: 0.15 },
                    speed: { v: 2 },
                    centerPoints: { ref: "myModule.points" },
                },
            })
            .construct();

        expectRoundTrips(graph);
    });

    it("Render node referring to module node", () => {
        const graph = new AlgorithmBuilder()
            .addModuleNode({
                id: "myModule",
                type: "orbit-module",
                params: {
                    time: { v: 0 },
                    speed: { v: 1 },
                    radius: { v: 0.1 },
                    numPoints: { v: 50 },
                },
            })
            .addRenderNode({
                id: "rendered",
                type: "circle",
                renderConfig: { layer: "live" },
                params: {
                    radius: { v: 0.02 },
                    centerPoints: { ref: "myModule.points" },
                    color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 1 } },
                },
            })
            .construct();

        expectRoundTrips(graph);
    });

    it("Handles refs nested inside a { v: [...] } array without misplacing the dependent node's stage", () => {
        const graph = new AlgorithmBuilder()
            .addControlNode({
                id: "radius",
                type: "slider",
                params: {},
            })
            .addComputeNode({
                id: "cp1",
                type: "colorPointCompute",
                params: {},
            })
            .addComputeNode({
                id: "cp2",
                type: "colorPointCompute",
                params: {},
            })
            .addComputeNode({
                id: "earthOrbit1",
                type: "orbit",
                params: {
                    centerPoints: {
                        v: [
                            {
                                v: {
                                    r: 1,
                                    g: 1,
                                    b: 1,
                                    a: 1,
                                    dx: 0,
                                    dy: 0,
                                    x: 0,
                                    y: 0,
                                },
                            },
                        ],
                    },
                    speed: { v: 1 },
                },
            })
            .addRenderNode({
                id: "circle",
                type: "circle",
                renderConfig: { layer: "live" },
                params: {
                    center: {
                        ref: "earthOrbit1.point",
                    },
                    centerPoints: {
                        v: [
                            {
                                v: { x: 0.2, y: 0.2, dx: 0, dy: 0, r: 1, g: 0, b: 0, a: 1 },
                            },
                            {
                                ref: "earthOrbit1.point",
                            },
                            {
                                v: { x: 0.8, y: 0.2, dx: 0, dy: 0, r: 0, g: 0, b: 1, a: 1 },
                            },
                        ],
                    },
                    radius: { v: 0.02 },
                },
            })
            .construct();

        const { rebuilt } = expectRoundTrips(graph);

        // The render node's nested ref to earthOrbit1 (a compute node) must not
        // have caused it to be misclassified as anything other than a render node.
        expect(rebuilt.render.nodes.some(n => n.id === "circle")).toBe(true);
    });

    it("Detects a cycle among module nodes and throws", () => {
        const graph: GeoArtGraph = {
            version: "2.0",
            control: { nodes: [] },
            compute: { nodes: [] },
            render: { nodes: [] },
            module: {
                nodes: [
                    {
                        id: "a",
                        type: "orbit-module",
                        params: {
                            time: { v: 0 },
                            speed: { v: 1 },
                            radius: { v: 0.1 },
                            numPoints: { v: 50 },
                            centerPoints: { ref: "b.points" },
                        },
                    } as ModuleNode,
                    {
                        id: "b",
                        type: "orbit-module",
                        params: {
                            time: { v: 0 },
                            speed: { v: 1 },
                            radius: { v: 0.1 },
                            numPoints: { v: 50 },
                            centerPoints: { ref: "a.points" },
                        },
                    } as ModuleNode,
                ],
            },
        };

        expect(() => graphToBuilderCode(graph)).toThrow();
    });
});
