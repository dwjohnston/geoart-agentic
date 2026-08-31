// Pre-compiled by src/schema/scripts/generate-validator.ts instead of being
// compiled at runtime via `new Ajv().compile(...)` (which uses `new
// Function(...)` internally) — dynamic code generation like that is
// disallowed inside the Cloudflare Workers runtime, which this validator
// also has to run in (see src/server/renderAlgorithmImage.ts).
import { validate as validateFn } from "./_generated/graphSchemaValidator.generated";

/**
 * Validate a serialized GeoArt graph against `src/schema/schema.json`.
 * Returns `false` on any validation error and never throws.
 */
export function validateGeoArtGraph(value: unknown): boolean {
	try {
		return Boolean(validateFn(value));
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
