import * as fs from "fs";
import { fileURLToPath } from "url";
import { resolve } from "path";
import { extractDerviedSchema } from "./extract-derived-schema";


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