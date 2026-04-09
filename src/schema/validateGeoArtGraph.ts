import Ajv, { type AnySchema } from "ajv";
import schema from "./schema.json";

const ajv = new Ajv({
	allErrors: true,
	strict: false,
});

const validateFn = ajv.compile(schema as unknown as AnySchema);

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
