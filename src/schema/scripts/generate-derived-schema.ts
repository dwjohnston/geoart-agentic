import { writeFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
    const schemaMainPath = resolve(import.meta.dirname, "../schema/schema.json");
    const outPath = resolve(import.meta.dirname, "../schema/refable-value-kinds.schema.json");

    const valueKindsSchema = await import("../schema/value-kinds.schema.json", { with: { type: "json" } });

    const refParamRef = { $ref: "schema.json#/definitions/refParam" };

    const definitions: Record<string, object> = {};

    for (const defName of Object.keys(valueKindsSchema.definitions)) {
        //@ts-expect-error - ignoring this for now
        const def = valueKindsSchema.definitions[defName];
        definitions[`${defName}OrRef`] = {
            title: `${def.title} Or Ref`,
            oneOf: [
                { $ref: `value-kinds.schema.json#/definitions/${defName}` },
                refParamRef,
            ],
        };
    }

    const output = {
        $schema: "http://json-schema.org/draft-07/schema#",
        title: "GeoArt Refable Value Kinds",
        description: "Param-level definitions: each value kind as either a static value or a ref to another node's output",
        definitions,
    };

    writeFileSync(outPath, JSON.stringify(output, null, 2));
    console.log(`Generated ${outPath}`);

    // suppress unused import warning
    void schemaMainPath;
}
