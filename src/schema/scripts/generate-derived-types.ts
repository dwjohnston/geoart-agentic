import { writeFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { generateOutputs } from "./extract-node-outputs";
import { jsonSchemaValueKindsToTypeScript } from "./extract-value-types";
import { buildNodeInputs } from "./extract-node-inputs";

import type { JSONSchema7 } from "json-schema";

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {

    const outPath = resolve(import.meta.dirname, "../_generated/node-outputs-2.ts");
    const valueKindsPath = resolve(import.meta.dirname, "../_generated/value-kinds-2.ts");

    const inPath = resolve(import.meta.dirname, "../_generated/node-inputs-2.ts");

    const schema = await import("../schema/schema.json", { with: { type: "json" } });

    const valueKindsSchema = await import("../schema/value-kinds.schema.json", { with: { type: "json" } });


    const outputString = generateOutputs(schema.default as unknown as JSONSchema7);

    const valueString = jsonSchemaValueKindsToTypeScript(valueKindsSchema)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inputObj = buildNodeInputs(schema as any)


    writeFileSync(outPath, outputString);
    writeFileSync(valueKindsPath, valueString);
    writeFileSync(inPath, inputObj)

}