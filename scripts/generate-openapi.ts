import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

/** 
 * The the purpose of this script is to turn the schema.json into an OpenAPI compliant spec. 
 * This way we can use StopLight elements as a documentation viewer.

 */

const root = resolve(import.meta.dir, "..");

const schemaRaw = readFileSync(
	resolve(root, "src/schema/schema.json"),
	"utf-8",
);
const schema = JSON.parse(schemaRaw);

// Rewrite all $ref strings from #/definitions/X to #/components/schemas/X
function rewriteRefs(value: unknown): unknown {
	if (typeof value === "string") {
		return value.replace(/^#\/definitions\//, "#/components/schemas/");
	}
	if (Array.isArray(value)) {
		return value.map(rewriteRefs);
	}
	if (value !== null && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>).map(([k, v]) => [
				k,
				rewriteRefs(v),
			]),
		);
	}
	return value;
}

const { definitions, ...rootSchema } = schema as Record<string, unknown>;

const componentSchemas = rewriteRefs(definitions) as Record<string, unknown>;
const graphSchema = rewriteRefs(rootSchema);

const openapi = {
	openapi: "3.1.0",
	info: {
		title: "GeoArt Graph Schema",
		version: schema.version ?? "1.0",
		description: schema.description ?? "",
	},
	paths: {
		"/graph": {
			post: {
				summary: "Serialised dataflow graph",
				description:
					"The complete graph document format for the Geometric Art Engine.",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/Graph" },
						},
					},
				},
				responses: {
					"200": {
						description: "OK",
					},
				},
			},
		},
	},
	components: {
		schemas: {
			Graph: graphSchema,
			...componentSchemas,
		},
	},
};

const outDir = resolve(root, "docs/public");
mkdirSync(outDir, { recursive: true });
writeFileSync(
	resolve(outDir, "openapi.json"),
	JSON.stringify(openapi, null, 2),
);
console.log("Generated docs/public/openapi.json");
