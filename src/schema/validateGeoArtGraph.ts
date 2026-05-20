import type { AnySchema } from "ajv";
import schema from "./schema/schema.json";
import valueKindsSchema from "./schema/value-kinds.schema.json";
import refableValueKindsSchema from "./schema/refable-value-kinds.schema.json";
import Ajv2019 from "ajv/dist/2019";

const ajv = new Ajv2019({
	allErrors: true,
	strict: false,
});

ajv.addSchema(
	valueKindsSchema as unknown as AnySchema,
	"value-kinds.schema.json",
);
ajv.addSchema(
	refableValueKindsSchema as unknown as AnySchema,
	"refable-value-kinds.schema.json",
);
ajv.addSchema(schema as unknown as AnySchema, "schema.json");

const validateFn = ajv.getSchema("schema.json");

/**
 * Validate a serialized GeoArt graph against `src/schema/schema.json`.
 * Returns `false` on any validation error and never throws.
 */
export function validateGeoArtGraph(value: unknown): boolean {
	try {
		return validateFn ? Boolean(validateFn(value)) : false;
	} catch {
		return false;
	}
}
