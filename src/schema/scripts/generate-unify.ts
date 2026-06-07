import * as fs from "node:fs";
import { resolve } from "node:path";
import $RefParser from "@apidevtools/json-schema-ref-parser";

const schemaPath = resolve(import.meta.dirname, "../schema/schema.json");
const outFile = resolve(import.meta.dirname, "../schema/schema-unified.generated.json");

try {
    const unified = await $RefParser.dereference(schemaPath);
    fs.writeFileSync(outFile, JSON.stringify(unified, null, 2));
    console.log("Generated schema-unified.generated.json");
} catch (err) {
    console.error("💥", err);
    process.exit(1);
}