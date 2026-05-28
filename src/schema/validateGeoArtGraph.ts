import { type AnySchema } from "ajv";
import schema from "./schema/schema.json";
import valueKindsSchema from "./schema/value-kinds.schema.json";
import refableValueKindsSchema from "./schema/refable-value-kinds.schema.json";
import Ajv2019 from "ajv/dist/2019"

const ajv = new Ajv2019({
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

export type ValidationErrorResult = {
	errors: string[];
};

/**
 * Validate a serialized GeoArt graph against `src/schema/schema.json`.
 * Returns `null` if valid, or an object with detailed error messages if invalid.
 * Never throws.
 */
export function validateGeoArtGraphWithErrors(value: unknown): null | ValidationErrorResult {
	try {
		if (!validateFn) {
			return {
				errors: ["Schema validator not initialized"],
			};
		}
		const valid = validateFn(value);
		if (!valid) {
			const errors = validateFn.errors || [];
			const messages = errors.map(err => {
				const path = err.instancePath || "/";
				const keyword = err.keyword;
				const message = err.message || "validation failed";
				return `${path}: ${message} (${keyword})`;
			});
			return { errors: messages };
		}
		return null;
	} catch (e) {
		return {
			errors: [`Schema validation error: ${String(e)}`],
		};
	}
}
