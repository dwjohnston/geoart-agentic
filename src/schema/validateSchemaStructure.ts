type SchemaValidationResult = {
	valid: boolean;
	errors: string[];
};

const NODE_TYPES = ['controlNode', 'computeNode', 'renderNode'] as const;
type NodeType = (typeof NODE_TYPES)[number];

const REQUIRED_SUFFIX: Record<NodeType, string> = {
	controlNode: 'Control Node',
	computeNode: 'Compute Node',
	renderNode: 'Render Node',
};

export function validateSchemaStructure(schema: unknown): SchemaValidationResult {
	const errors: string[] = [];

	if (typeof schema !== 'object' || schema === null) {
		return { valid: false, errors: ['Schema must be an object'] };
	}

	const s = schema as Record<string, unknown>;

	if (typeof s['definitions'] !== 'object' || s['definitions'] === null) {
		return { valid: false, errors: ['Schema must have a definitions object'] };
	}

	const defs = s['definitions'] as Record<string, unknown>;

	for (const nodeType of NODE_TYPES) {
		if (!(nodeType in defs)) {
			errors.push(`Missing definition: ${nodeType}`);
			continue;
		}

		const nodeDef = defs[nodeType] as Record<string, unknown>;

		if (!Array.isArray(nodeDef['oneOf'])) {
			errors.push(`${nodeType} must have a oneOf array`);
			continue;
		}

		const suffix = REQUIRED_SUFFIX[nodeType];

		for (const [index, item] of nodeDef['oneOf'].entries()) {
			if (typeof item !== 'object' || item === null) {
				errors.push(`${nodeType}.oneOf[${index}] must be an object`);
				continue;
			}
			const itemObj = item as Record<string, unknown>;
			if (typeof itemObj['title'] !== 'string') {
				errors.push(`${nodeType}.oneOf[${index}] must have a title string`);
				continue;
			}
			if (!itemObj['title'].endsWith(suffix)) {
				errors.push(
					`${nodeType}.oneOf[${index}] title "${itemObj['title']}" must end with "${suffix}"`
				);
			}
		}
	}

	return { valid: errors.length === 0, errors };
}
