// Reads value-kinds.schema.json and writes enum-controls.schema.generated.json,
// generating a control node entry for each enum value kind (names ending in "EnumValue").
import * as fs from "fs";
import { fileURLToPath } from "url";
import { resolve } from "path";

function camelToWords(camel: string): string {
    return camel
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateEnumControls(schema: any) {
    const definitions: Record<string, object> = {};

    for (const defName of Object.keys(schema.definitions as Record<string, unknown>)) {
        if (!defName.endsWith('EnumValue')) continue;

        const baseName = defName.slice(0, -'EnumValue'.length);
        const selectorType = `${baseName}Selector`;
        const titleBase = camelToWords(baseName);

        definitions[selectorType] = {
            title: `${titleBase} Selector Control Node`,
            type: "object",
            description: `Dropdown selector for ${titleBase.toLowerCase()}`,
            additionalProperties: false,
            required: ["id", "type", "params"],
            "x-outputs": [{ name: "value", valueType: defName }],
            properties: {
                id: { title: "ID", type: "string" },
                type: { title: "Type", type: "string", enum: [selectorType] },
                params: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        label: { $ref: "value-kinds.schema.json#/definitions/stringValue" },
                        value: { $ref: `value-kinds.schema.json#/definitions/${defName}` },
                    }
                }
            }
        };
    }

    return {
        $schema: "https://json-schema.org/draft/2019-09/schema",
        title: "GeoArt Enum Controls",
        description: "Generated enum control node schema entries — one per enum value kind",
        definitions,
    };
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
    try {
        const schema = await import("../schema/value-kinds.schema.json", { with: { type: "json" } });
        const output = generateEnumControls(schema);
        const outFile = resolve(import.meta.dirname, "../schema/enum-controls.schema.generated.json");
        fs.writeFileSync(outFile, JSON.stringify(output, null, 2) + "\n", {});
        console.log("Generated enum-controls.schema.generated.json");
    } catch (err) {
        console.error("💥", err);
        process.exit(1);
    }
}
