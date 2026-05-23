import { type AnySchema } from 'ajv';
import schema from './schema/schema.json';
import valueKindsSchema from './schema/value-kinds.schema.json';
import refableValueKindsSchema from './schema/refable-value-kinds.schema.json';
import Ajv2019 from 'ajv/dist/2019';

const ajv = new Ajv2019({ allErrors: true, strict: false });
ajv.addSchema(valueKindsSchema as unknown as AnySchema, 'value-kinds.schema.json');
ajv.addSchema(refableValueKindsSchema as unknown as AnySchema, 'refable-value-kinds.schema.json');
ajv.addSchema(schema as unknown as AnySchema, 'schema.json');

const validateFn = ajv.getSchema('schema.json');

export type ValidationResult = { valid: true } | { valid: false; errors: string[] };

export function validateGeoArtGraphWithErrors(value: unknown): ValidationResult {
  if (!validateFn) return { valid: false, errors: ['Validator not initialised'] };
  const ok = validateFn(value);
  if (ok) return { valid: true };
  const errors = (validateFn.errors ?? []).map(e =>
    `${e.instancePath || '(root)'} ${e.message ?? ''}`.trim(),
  );
  return { valid: false, errors };
}
