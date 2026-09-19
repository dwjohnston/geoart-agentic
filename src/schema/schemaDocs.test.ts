import { describe, expect, it } from "bun:test";
import { buildSchemaDocs, formatLiteral, nodeExample, parseParamRef } from "./schemaDocs";
import { validateGeoArtGraph } from "./validateGeoArtGraph";
import { AlgorithmBuilder } from "./builder";
import type { GeoArtGraph } from "./_generated/schema-types";

const docs = buildSchemaDocs();

describe(parseParamRef, () => {
    it("Refable value kinds strip the OrRef suffix", () => {
        expect(parseParamRef("refable-value-kinds.schema.json#/definitions/numberValueOrRef")).toEqual({
            valueKind: "numberValue",
            refable: true,
        });
    });

    it("Static value kinds are not refable", () => {
        expect(parseParamRef("value-kinds.schema.json#/definitions/stringValue")).toEqual({
            valueKind: "stringValue",
            refable: false,
        });
    });
});

describe(buildSchemaDocs, () => {
    it("Produces one section per node layer, in layer order", () => {
        expect(docs.sections.map(s => s.key)).toEqual(["control", "compute", "render", "module"]);
        for (const section of docs.sections) {
            expect(section.nodes.length).toBeGreaterThan(0);
        }
    });

    it("Documents the slider control node from the schema", () => {
        const slider = docs.sections[0].nodes.find(n => n.type === "slider");
        expect(slider).toBeDefined();
        expect(slider!.title).toBe("Slider Control Node");
        expect(slider!.params.map(p => p.name)).toEqual(["label", "min", "max", "value", "step"]);
        expect(slider!.params[0]).toMatchObject({ valueKind: "stringValue", refable: false });
        expect(slider!.outputs).toEqual([{ name: "value", valueType: "numberValue" }]);
        expect(slider!.hasRenderConfig).toBe(false);
    });

    it("Render nodes carry renderConfig and the layer enum is documented", () => {
        for (const node of docs.sections[2].nodes) {
            expect(node.hasRenderConfig).toBe(true);
        }
        const layer = docs.renderConfigFields.find(f => f.name === "layer");
        expect(layer).toMatchObject({ required: true, type: '"paint" | "live"' });
    });

    it("Excludes node sections from the top-level graph fields", () => {
        const names = docs.graphFields.map(f => f.name);
        expect(names).toContain("version");
        expect(names).toContain("speed");
        expect(names).not.toContain("control");
        expect(names).not.toContain("render");
    });

    it("Marks runtime-only value kinds as not statically writable", () => {
        const sampler = docs.valueKinds.find(k => k.name === "samplerValue");
        const number = docs.valueKinds.find(k => k.name === "numberValue");
        expect(sampler?.staticAllowed).toBe(false);
        expect(number?.staticAllowed).toBe(true);
    });

    it("Summarises enum and array value kinds by their payload", () => {
        const wave = docs.valueKinds.find(k => k.name === "waveTypeEnumValue");
        expect(wave?.enumValues).toContain("sine");
        // Array items are whole value kinds (`{ v: [{ v: 1 }] }`), so the
        // item is named by kind rather than expanded to its payload.
        const numbers = docs.valueKinds.find(k => k.name === "numberArrayValue");
        expect(numbers?.shape).toBe("numberValue[]");
    });
});

describe(formatLiteral, () => {
    it("JSON output is parseable and TypeScript output uses bare keys", () => {
        const value = { id: "a", params: { v: [1, 2] } };
        expect(JSON.parse(formatLiteral(value, "json"))).toEqual(value);
        expect(formatLiteral(value, "typescript")).toContain("id: 'a'");
    });
});

describe(nodeExample, () => {
    it("Every JSON node example is valid schema-wise when placed in its section", () => {
        for (const section of docs.sections) {
            for (const node of section.nodes) {
                const example = JSON.parse(nodeExample(node, "json"));
                const graph: GeoArtGraph = {
                    version: "2.0",
                    control: { nodes: [] },
                    compute: { nodes: [] },
                    render: { nodes: [] },
                    module: { nodes: [] },
                };
                graph[section.key]!.nodes.push(example);
                expect(validateGeoArtGraph(graph)).toBe(true);
            }
        }
    });

    it("TypeScript examples are builder method calls", () => {
        const slider = docs.sections[0].nodes.find(n => n.type === "slider")!;
        const example = nodeExample(slider, "typescript");
        expect(example.startsWith(".addControlNode({")).toBe(true);

        // The generated snippet is our own output, evaluated here only to
        // prove it is syntactically a valid builder call.
        const fn = new Function("AlgorithmBuilder", `return new AlgorithmBuilder()${example}.construct()`);
        const graph = fn(AlgorithmBuilder) as GeoArtGraph;
        expect(graph.control.nodes[0].type).toBe("slider");
    });
});
