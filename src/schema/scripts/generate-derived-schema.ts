import * as fs from "fs";
import { fileURLToPath } from "url";
import { resolve } from "path";


const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {


    try {
        const schema = await import("../schema/value-kinds.schema.json", { with: { type: "json" } });

        const refParamRef = { $ref: "schema.json#/definitions/refParam" };

        const definitions: Record<string, object> = {};

        for (const defName of Object.keys(schema.definitions)) {
            //@ts-expect-error - ignoring this for now
            const def = schema.definitions[defName];
            definitions[`${defName}OrRef`] = {
                title: `${def.title} Or Ref`,
                oneOf: [
                    { $ref: `value-kinds.schema.json#/definitions/${defName}` },
                    refParamRef,
                ],
            };
        }

        const output = {
            $schema: "https://json-schema.org/draft/2019-09/schema",
            title: "GeoArt Refable Value Kinds",
            description: "Param-level definitions: each value kind as either a static value or a ref to another node's output",
            definitions,
        };

        const outFile = resolve(import.meta.dirname, "../schema/refable-value-kinds.schema.json")
        fs.writeFileSync(outFile, JSON.stringify(output, null, 2), {});
        console.log("Generated refable-value-kinds.schema.json");
    }
    catch (err) {
        console.error("💥", err);
        process.exit(1)
    }
}