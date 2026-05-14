// Reads value-kinds.schema.json and writes refable-value-kinds.schema.json,
// extending each value type to also accept a ref.
import * as fs from "fs";
import { fileURLToPath } from "url";
import { resolve } from "path";

function fixInternalRefs(obj: Record<string, unknown> | unknown[], currentDepth = 0): Record<string, unknown> | unknown[] {
    if (currentDepth > 10) return obj;
    if (obj === null || typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
        return obj.map((item) => fixInternalRefs(item as Record<string, unknown> | unknown[], currentDepth + 1));
    }

    const result = { ...(obj as Record<string, unknown>) };

    if (result.$ref && typeof result.$ref === "string" && result.$ref.startsWith("#/definitions/")) {
        result.$ref = `value-kinds.schema.json${result.$ref}`;
    }

    for (const key of Object.keys(result)) {
        result[key] = fixInternalRefs(result[key] as Record<string, unknown> | unknown[], currentDepth + 1);
    }

    return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractDerviedSchema(schema: any) {
    const definitions: Record<string, object> = {};

    const refParamRef = { $ref: "schema.json#/definitions/refParam" };

    for (const defName of Object.keys(schema.definitions)) {
        const def = schema.definitions[defName];

        const isArrayType = def.properties?.v?.type === "array";

        if (isArrayType) {
            const baseItemRef = def.properties.v.items;
            const orRefDef = JSON.parse(JSON.stringify(def));

            orRefDef.properties.v.items = {
                oneOf: [
                    fixInternalRefs(baseItemRef),
                    refParamRef,
                ],
            };

            definitions[`${defName}OrRef`] = {
                title: `${def.title} Or Ref`,
                oneOf: [
                    fixInternalRefs(orRefDef),
                    refParamRef,
                ],
            };
        } else {
            definitions[`${defName}OrRef`] = {
                title: `${def.title} Or Ref`,
                oneOf: [
                    { $ref: `value-kinds.schema.json#/definitions/${defName}` },
                    refParamRef,
                ],
            };
        }
    }

    return {
        $schema: "https://json-schema.org/draft/2019-09/schema",
        title: "GeoArt Refable Value Kinds",
        description: "Param-level definitions: each value kind as either a static value or a ref to another node's output",
        definitions,
    };
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
    try {
        const schema = await import("../schema/value-kinds.schema.json", { with: { type: "json" } });

        const output = extractDerviedSchema(schema)

        const outFile = resolve(import.meta.dirname, "../schema/refable-value-kinds.schema.json")
        fs.writeFileSync(outFile, JSON.stringify(output, null, 2), {});
        console.log("Generated refable-value-kinds.schema.json");
    }
    catch (err) {
        console.error("💥", err);
        process.exit(1)
    }
}
