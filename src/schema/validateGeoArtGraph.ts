import Ajv, { type AnySchema } from "ajv";
import schema from "./schema/schema.json";
import valueKindsSchema from "./schema/value-kinds.schema.json";
import refableValueKindsSchema from "./schema/refable-value-kinds.schema.json";

const ajv = new Ajv({
	allErrors: true,
	strict: false,
});

ajv.addSchema(valueKindsSchema as unknown as AnySchema, "value-kinds.schema.json");
ajv.addSchema(refableValueKindsSchema as unknown as AnySchema, "refable-value-kinds.schema.json");
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
