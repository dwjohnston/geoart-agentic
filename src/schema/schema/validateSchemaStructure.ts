type SchemaValidationResult = {
	valid: boolean;
	errors: string[];
};

/**
 * A map of schema filename → parsed JSON content.
 * The expected keys are:
 *   - "schema.json"
 *   - "value-kinds.schema.json"
 *   - "refable-value-kinds.schema.json"
 */
export type SchemaSet = Record<
	"schema.json" | "value-kinds.schema.json" | "refable-value-kinds.schema.json",
	unknown
>;

const NODE_TYPES = ["controlNode", "computeNode", "renderNode"] as const;
type NodeType = (typeof NODE_TYPES)[number];

const REQUIRED_SUFFIX: Record<NodeType, string> = {
	controlNode: "Control Node",
	computeNode: "Compute Node",
	renderNode: "Render Node",
};

/**
 * Extract the filename portion from a `$ref` string.
 * Returns `null` for bare fragment refs (those that start with `#`).
 */
function refFilename(ref: string): string | null {
	const hashIndex = ref.indexOf("#");
	if (hashIndex === 0) return null; // bare fragment
	if (hashIndex > 0) return ref.slice(0, hashIndex);
	return ref; // no hash — entire string is the filename
}

export function validateSchemaStructure(
	schemas: SchemaSet,
): SchemaValidationResult {
	const errors: string[] = [];

	// ── 1. schema.json must exist and be a valid object ──────────────────────
	const mainSchema = schemas["schema.json"];

	if (typeof mainSchema !== "object" || mainSchema === null) {
		return { valid: false, errors: ["Schema must be an object"] };
	}

	const s = mainSchema as Record<string, unknown>;

	if (typeof s.definitions !== "object" || s.definitions === null) {
		return { valid: false, errors: ["Schema must have a definitions object"] };
	}

	const defs = s.definitions as Record<string, unknown>;

	// ── 2. Title-convention checks (existing rules) ───────────────────────────
	for (const nodeType of NODE_TYPES) {
		if (!(nodeType in defs)) {
			errors.push(`Missing definition: ${nodeType}`);
			continue;
		}

		const nodeDef = defs[nodeType] as Record<string, unknown>;

		if (!Array.isArray(nodeDef.oneOf)) {
			errors.push(`${nodeType} must have a oneOf array`);
			continue;
		}

		const suffix = REQUIRED_SUFFIX[nodeType];

		for (const [index, item] of nodeDef.oneOf.entries()) {
			if (typeof item !== "object" || item === null) {
				errors.push(`${nodeType}.oneOf[${index}] must be an object`);
				continue;
			}
			const itemObj = item as Record<string, unknown>;
			if (typeof itemObj.title !== "string") {
				errors.push(`${nodeType}.oneOf[${index}] must have a title string`);
				continue;
			}
			if (!itemObj.title.endsWith(suffix)) {
				errors.push(
					`${nodeType}.oneOf[${index}] title "${itemObj.title}" must end with "${suffix}"`,
				);
			}
		}
	}

	// ── 3. Naming conventions for auxiliary schema files ─────────────────────

	const valueKinds = schemas["value-kinds.schema.json"];
	const refableValueKinds = schemas["refable-value-kinds.schema.json"];

	if (valueKinds !== undefined) {
		const vk = valueKinds as Record<string, unknown>;
		const vkDefs = vk.definitions as Record<string, unknown> | undefined;
		if (vkDefs !== undefined) {
			for (const name of Object.keys(vkDefs)) {
				if (!name.endsWith("Value")) {
					errors.push(
						`value-kinds.schema.json: definition "${name}" must end with "Value"`,
					);
				}
			}
		}
	}

	if (refableValueKinds !== undefined) {
		const rvk = refableValueKinds as Record<string, unknown>;
		const rvkDefs = rvk.definitions as Record<string, unknown> | undefined;
		if (rvkDefs !== undefined) {
			for (const name of Object.keys(rvkDefs)) {
				if (!name.endsWith("ValueOrRef")) {
					errors.push(
						`refable-value-kinds.schema.json: definition "${name}" must end with "ValueOrRef"`,
					);
				}
			}
		}
	}

	// ── 3b. Array value kinds must end with "Array" and vice versa ──────────────
	// The convention: if a value kind (name without "Value" suffix) ends with "Array",
	// then its v property must be an array type, and vice versa.
	if (valueKinds !== undefined) {
		const vk = valueKinds as Record<string, unknown>;
		const vkDefs = vk.definitions as Record<string, unknown> | undefined;
		if (vkDefs !== undefined) {
			for (const [name, def] of Object.entries(vkDefs)) {
				if (typeof def !== "object" || def === null) continue;
				const defObj = def as Record<string, unknown>;

				// Extract the kind by removing "Value" suffix
				const kind = name.endsWith("Value") ? name.slice(0, -5) : name;

				// Check if the definition's `v` property is an array
				const props = defObj.properties as
					| Record<string, unknown>
					| undefined;
				const vProp = props?.v as Record<string, unknown> | undefined;
				const isArrayType =
					vProp?.type === "array" ||
					typeof vProp?.items !== "undefined";
				const kindEndsWithArray = kind.endsWith("Array");

				if (isArrayType && !kindEndsWithArray) {
					errors.push(
						`value-kinds.schema.json: "${name}" (kind: "${kind}") has an array type but the kind does not end with "Array"`,
					);
				} else if (!isArrayType && kindEndsWithArray) {
					errors.push(
						`value-kinds.schema.json: "${name}" (kind: "${kind}") kind ends with "Array" but does not have an array type`,
					);
				}
			}
		}
	}

	// ── 4. x-outputs completeness ─────────────────────────────────────────────
	// Collect valid valueType names from value-kinds.schema.json
	const validValueTypes = new Set<string>();
	if (valueKinds !== undefined) {
		const vk = valueKinds as Record<string, unknown>;
		const vkDefs = vk.definitions as Record<string, unknown> | undefined;
		if (vkDefs !== undefined) {
			for (const name of Object.keys(vkDefs)) {
				validValueTypes.add(name);
			}
		}
	}

	for (const nodeType of NODE_TYPES) {
		if (!(nodeType in defs)) continue; // already reported above

		const nodeDef = defs[nodeType] as Record<string, unknown>;
		if (!Array.isArray(nodeDef.oneOf)) continue;

		for (const [index, item] of nodeDef.oneOf.entries()) {
			if (typeof item !== "object" || item === null) continue;
			const itemObj = item as Record<string, unknown>;

			// Check x-outputs exists and is an array
			if (!Array.isArray(itemObj["x-outputs"])) {
				errors.push(`${nodeType}.oneOf[${index}] must have an x-outputs array`);
				continue;
			}

			// Only validate valueType if value-kinds.schema.json was provided
			if (validValueTypes.size === 0) continue;

			for (const [outIndex, output] of itemObj["x-outputs"].entries()) {
				if (typeof output !== "object" || output === null) {
					errors.push(
						`${nodeType}.oneOf[${index}].x-outputs[${outIndex}] must be an object`,
					);
					continue;
				}
				const outputObj = output as Record<string, unknown>;
				if (typeof outputObj.valueType !== "string") {
					errors.push(
						`${nodeType}.oneOf[${index}].x-outputs[${outIndex}] must have a valueType string`,
					);
					continue;
				}
				if (!validValueTypes.has(outputObj.valueType)) {
					errors.push(
						`${nodeType}.oneOf[${index}].x-outputs[${outIndex}] valueType "${outputObj.valueType}" is not defined in value-kinds.schema.json`,
					);
				}
			}
		}
	}

	// ── 5. Param origin by layer ──────────────────────────────────────────────
	// Only run if both auxiliary schemas are present (cross-file checks require them)
	if (valueKinds !== undefined && refableValueKinds !== undefined) {
		const controlLayerFile = "value-kinds.schema.json";
		const computeRenderLayerFile = "refable-value-kinds.schema.json";

		const layerExpectedFile: Record<NodeType, string> = {
			controlNode: controlLayerFile,
			computeNode: computeRenderLayerFile,
			renderNode: computeRenderLayerFile,
		};

		for (const nodeType of NODE_TYPES) {
			if (!(nodeType in defs)) continue;

			const nodeDef = defs[nodeType] as Record<string, unknown>;
			if (!Array.isArray(nodeDef.oneOf)) continue;

			const expectedFile = layerExpectedFile[nodeType];

			for (const [index, item] of nodeDef.oneOf.entries()) {
				if (typeof item !== "object" || item === null) continue;
				const itemObj = item as Record<string, unknown>;

				const params = itemObj.params as Record<string, unknown> | undefined;
				if (!params) continue;

				const properties = params.properties as
					| Record<string, unknown>
					| undefined;
				if (!properties) continue;

				for (const [paramName, paramDef] of Object.entries(properties)) {
					if (typeof paramDef !== "object" || paramDef === null) continue;
					const paramObj = paramDef as Record<string, unknown>;
					const ref = paramObj.$ref;
					if (typeof ref !== "string") continue;

					// Only check cross-file refs (those with a filename before `#`)
					const filename = refFilename(ref);
					if (filename === null) continue; // bare fragment — skip

					if (filename !== expectedFile) {
						errors.push(
							`${nodeType}.oneOf[${index}].params.properties.${paramName}: ` +
								`$ref "${ref}" must resolve into ${expectedFile}, but points to ${filename}`,
						);
					}
				}
			}
		}
	}

	return { valid: errors.length === 0, errors };
}
