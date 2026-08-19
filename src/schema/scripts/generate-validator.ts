// Pre-compiles the GeoArt graph JSON schema into a standalone validator
// module (no runtime `new Function`), written to
// src/schema/_generated/graphSchemaValidator.generated.ts.
//
// AJV normally compiles schemas into validator functions at runtime via
// `new Function(...)`. That's disallowed inside the Cloudflare Workers
// runtime (workerd sandboxes out dynamic code generation), which breaks the
// `/render/<base64>` server endpoint (and Vite's dev-server worker-entry
// probing) as soon as it imports `validateGeoArtGraph`. `ajv/dist/standalone`
// generates the equivalent validator as plain, already-compiled JS/TS source
// instead, so no `eval`/`new Function` ever runs.
import * as fs from "fs";
import { fileURLToPath } from "url";
import { resolve } from "path";
import { type AnySchema } from "ajv";
import Ajv2019 from "ajv/dist/2019";
import standaloneCode from "ajv/dist/standalone";

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
    try {
        const schema = await import("../schema/schema.json", { with: { type: "json" } });
        const valueKindsSchema = await import("../schema/value-kinds.schema.json", { with: { type: "json" } });
        const refableValueKindsSchema = await import("../schema/refable-value-kinds.schema.json", { with: { type: "json" } });

        // Mirrors validateGeoArtGraph.ts's runtime setup exactly, but with
        // `code: { source: true, esm: true }` so the compiled validator can
        // be extracted as standalone ESM source via `standaloneCode`.
        const ajv = new Ajv2019({
            allErrors: true,
            strict: false,
            code: { source: true, esm: true },
        });

        ajv.addSchema(valueKindsSchema.default as unknown as AnySchema, "value-kinds.schema.json");
        ajv.addSchema(refableValueKindsSchema.default as unknown as AnySchema, "refable-value-kinds.schema.json");
        ajv.addSchema(schema.default as unknown as AnySchema, "schema.json");

        const validateFn = ajv.getSchema("schema.json");
        if (!validateFn) {
            throw new Error("Failed to compile schema.json");
        }

        const moduleCode = standaloneCode(ajv, validateFn);

        const outDir = resolve(import.meta.dirname, "../_generated");
        fs.mkdirSync(outDir, { recursive: true });

        // Written as plain .js (not .ts): the generated code is unannotated
        // AJV-internal JS that isn't meant to satisfy this project's strict
        // TypeScript checks — a co-located hand-written .d.ts gives it a
        // clean type instead, the same pattern already used for
        // schema-types.d.ts alongside the generated JSON-schema-to-TS output.
        const outFile = resolve(outDir, "graphSchemaValidator.generated.js");
        fs.writeFileSync(outFile, moduleCode);

        const dtsFile = resolve(outDir, "graphSchemaValidator.generated.d.ts");
        fs.writeFileSync(
            dtsFile,
            `import type { ValidateFunction } from "ajv";\nexport const validate: ValidateFunction;\n`
        );

        console.log("Generated graphSchemaValidator.generated.js");
    } catch (err) {
        console.error("💥", err);
        process.exit(1);
    }
}
