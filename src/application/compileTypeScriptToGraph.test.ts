import { describe, expect, it } from "bun:test";
import { compileTypeScriptToGraph } from "./compileTypeScriptToGraph";
import { AlgorithmBuilder } from "../schema/builder";
import { graphToBuilderCode } from "../schema/builderCodegen";
import type { GeoArtGraph } from "../schema/_generated/schema-types";

function sortById<T extends { id: string }>(nodes: T[]): T[] {
    return [...nodes].sort((a, b) => a.id.localeCompare(b.id));
}

describe(compileTypeScriptToGraph, () => {
    it("Compiles a simple one-line chain ending in .construct(); with no return", () => {
        const source = `new AlgorithmBuilder().addControlNode({ id: 'speed', type: 'slider', params: { label: { v: 'Speed' }, min: { v: 0 }, max: { v: 5 }, value: { v: 1 } } }).construct();`;

        const result = compileTypeScriptToGraph(source);

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.graph.control.nodes).toHaveLength(1);
        expect(result.graph.control.nodes.some(n => n.id === "speed")).toBe(true);
    });

    it("Compiles a multi-statement script with a for loop reassigning the builder, ending in a plain expression", () => {
        const source = `
            let builder = new AlgorithmBuilder();
            const count = 3;
            for (let i = 0; i < count; i++) {
                builder = builder.addComputeNode({
                    id: 'node' + i,
                    type: 'add',
                    params: {
                        a: { v: i },
                        b: { v: 1 },
                    },
                });
            }
            builder.construct();
        `;

        const result = compileTypeScriptToGraph(source);

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.graph.compute.nodes).toHaveLength(3);
        expect(sortById(result.graph.compute.nodes).map(n => n.id)).toEqual(["node0", "node1", "node2"]);
    });

    it("Also accepts a script whose last statement is already an explicit return", () => {
        const source = `
            let builder = new AlgorithmBuilder();
            const count = 2;
            for (let i = 0; i < count; i++) {
                builder = builder.addComputeNode({
                    id: 'n' + i,
                    type: 'add',
                    params: { a: { v: i }, b: { v: 1 } },
                });
            }
            return builder.construct();
        `;

        const result = compileTypeScriptToGraph(source);

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.graph.compute.nodes).toHaveLength(2);
    });

    it("Fails on empty source", () => {
        const result = compileTypeScriptToGraph("");

        expect(result.success).toBe(false);
        if (result.success) return;
        expect(result.error).toContain("empty");
    });

    it("Fails when script ends with a non-expression statement (e.g. a bare for loop)", () => {
        const source = `
            let builder = new AlgorithmBuilder();
            for (let i = 0; i < 3; i++) {
                builder = builder.addComputeNode({
                    id: 'n' + i,
                    type: 'add',
                    params: { a: { v: i }, b: { v: 1 } },
                });
            }
        `;

        const result = compileTypeScriptToGraph(source);

        expect(result.success).toBe(false);
        if (result.success) return;
        expect(result.error).toContain("must end with an expression");
    });

    it("Fails on a syntax error in the source", () => {
        const source = `new AlgorithmBuilder().addComputeNode({ id: 'n', type: 'add', params: { a: { v: 1 } }).construct(`;

        const result = compileTypeScriptToGraph(source);

        expect(result.success).toBe(false);
        if (result.success) return;
        expect(result.error.length).toBeGreaterThan(0);
    });

    it("Fails when the last expression evaluates to something that fails schema validation", () => {
        const source = `({});`;

        const result = compileTypeScriptToGraph(source);

        expect(result.success).toBe(false);
        if (result.success) return;
        expect(result.error.length).toBeGreaterThan(0);
    });

    it("Fails cleanly (does not throw) when the script throws at runtime via an undefined reference", () => {
        const source = `thisVariableDoesNotExist.construct();`;

        expect(() => compileTypeScriptToGraph(source)).not.toThrow();
        const result = compileTypeScriptToGraph(source);

        expect(result.success).toBe(false);
        if (result.success) return;
        expect(result.error.length).toBeGreaterThan(0);
    });

    it("Fails cleanly (does not throw) when the script calls a method that doesn't exist at runtime", () => {
        const source = `
            new AlgorithmBuilder()
                .addComputeNode({ id: 'n', type: 'add', params: { a: { v: 1 }, b: { v: 2 } } })
                .thisMethodDoesNotExist();
        `;

        expect(() => compileTypeScriptToGraph(source)).not.toThrow();
        const result = compileTypeScriptToGraph(source);

        expect(result.success).toBe(false);
        if (result.success) return;
        expect(result.error).toContain("thisMethodDoesNotExist");
    });

    it("Round-trips a graph built via AlgorithmBuilder through graphToBuilderCode and back", () => {
        const original: GeoArtGraph = new AlgorithmBuilder()
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

        const source = graphToBuilderCode(original);
        const result = compileTypeScriptToGraph(source);

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.graph.title).toBe(original.title);
        expect(result.graph.author).toBe(original.author);
        expect(result.graph.description).toBe(original.description);

        expect(sortById(result.graph.control.nodes)).toEqual(sortById(original.control.nodes));
        expect(sortById(result.graph.compute.nodes)).toEqual(sortById(original.compute.nodes));
        expect(sortById(result.graph.render.nodes)).toEqual(sortById(original.render.nodes));
        expect(sortById(result.graph.module?.nodes ?? [])).toEqual(sortById(original.module?.nodes ?? []));
    });

    it("Round-trips a graph with module nodes through graphToBuilderCode and back", () => {
        const original: GeoArtGraph = new AlgorithmBuilder()
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

        const source = graphToBuilderCode(original);
        const result = compileTypeScriptToGraph(source);

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(sortById(result.graph.module?.nodes ?? [])).toEqual(sortById(original.module?.nodes ?? []));
        expect(sortById(result.graph.compute.nodes)).toEqual(sortById(original.compute.nodes));
    });
});
