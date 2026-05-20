// Reads schema.json and value-kinds.schema.json and writes node-outputs-2.ts,
// value-kinds-2.ts, and node-inputs-2.ts to src/schema/_generated/.
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { JSONSchema7 } from "json-schema";
import { TypeNarrowingError } from "../../common-tooling/errors/TypeNarrowingError";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonSchema = Record<string, any>;

// --- node outputs ---

type NodeOutputEntry = { name: string; valueType: string };

type NodeDef = {
	"x-outputs"?: NodeOutputEntry[];
	properties?: {
		type?: { enum?: string[] };
	};
};

export function generateOutputs(schema: JSONSchema7): string {
	const definitions = schema.definitions as Record<
		string,
		{ oneOf?: NodeDef[] }
	>;

	const entries: Record<string, NodeOutputEntry[]> = {};

	for (const sectionKey of ["controlNode", "computeNode", "renderNode"]) {
		const section = definitions[sectionKey];
		if (!section?.oneOf) continue;

		for (const nodeDef of section.oneOf) {
			const typeKey = nodeDef.properties?.type?.enum?.[0];
			const outputs = nodeDef["x-outputs"] ?? [];
			if (typeKey) {
				entries[typeKey] = outputs;
			}
		}
	}

	const lines: string[] = [
		"// generated — do not edit",
		"export const nodeOutputMeta = {",
	];

	for (const [typeKey, outputs] of Object.entries(entries)) {
		lines.push(
			`  ${JSON.stringify(typeKey)}: ${JSON.stringify(outputs)} as const,`,
		);
	}

	lines.push("} as const;");
	lines.push("");

	return lines.join("\n");
}

// --- value types ---

function deriveKind(key: string): string {
	const stripped = key.endsWith("Value") ? key.slice(0, -"Value".length) : key;
	return stripped.charAt(0).toLowerCase() + stripped.slice(1);
}

function schemaToTs(
	schema: JsonSchema,
	allDefs: Record<string, JsonSchema>,
): string {
	if (schema.$ref) {
		const refKey = schema.$ref.replace(/^#\/definitions\//, "");
		const refDef = allDefs[refKey];
		if (refDef?.properties?.v) {
			return schemaToTs(refDef.properties.v, allDefs);
		}
		return "unknown";
	}

	const type = schema.type;

	if (Array.isArray(type)) {
		return type
			.map((t) => schemaToTs({ ...schema, type: t }, allDefs))
			.join(" | ");
	}

	if (type === "number") return "number";
	if (type === "boolean") return "boolean";
	if (type === "null") return "null";

	if (type === "string") {
		if (schema.enum) {
			return schema.enum.map((v: string) => `"${v}"`).join(" | ");
		}
		return "string";
	}

	if (type === "array") {
		const itemType = schema.items
			? schemaToTs(schema.items, allDefs)
			: "unknown";
		return `Array<${itemType}>`;
	}

	if (type === "object" && schema.properties) {
		const fields = Object.entries(
			schema.properties as Record<string, JsonSchema>,
		)
			.map(([k, v]) => `${k}: ${schemaToTs(v, allDefs)}`)
			.join("; ");
		return `{ ${fields} }`;
	}

	return "unknown";
}

export function jsonSchemaValueKindsToTypeScript(schema: JsonSchema): string {
	const allDefs: Record<string, JsonSchema> = {
		...(schema.definitions ?? {}),
	};
	for (const [key, val] of Object.entries(schema)) {
		if (
			!["$schema", "title", "description", "definitions"].includes(key) &&
			typeof val === "object"
		) {
			allDefs[key] = val;
		}
	}

	const lines: string[] = [];

	for (const [defKey, defSchema] of Object.entries(allDefs)) {
		const typeName = `V_${defKey}`;
		const kind = deriveKind(defKey);
		const vSchema = defSchema?.properties?.v;

		if (!vSchema) continue;

		const vType = schemaToTs(vSchema, allDefs);
		lines.push(`export type ${typeName} = { kind: '${kind}'; v: ${vType} };`);
	}

	const unionLine = `export type ValueTypes = ${Object.keys(allDefs)
		.filter((key) => allDefs[key]?.properties?.v)
		.map((key) => `V_${key}`)
		.join(" | ")};`;

	lines.push("");
	lines.push(unionLine);

	return lines.join("\n");
}

// --- node inputs ---

type ParamInput = {
	valueType: string;
};

type NodeInputMap = Record<string, Record<string, ParamInput>>;

interface SchemaParamDef {
	$ref?: string;
}

interface SchemaVariant {
	properties: {
		type: { enum: [string] };
		params?: { properties?: Record<string, SchemaParamDef> };
	};
}

interface SectionDef {
	oneOf: SchemaVariant[];
}

interface Schema {
	definitions: {
		controlNode: SectionDef;
		computeNode: SectionDef;
		renderNode: SectionDef;
	};
}

function extractValueType(ref: string): string {
	const last = ref.split("/").pop();
	if (!last) throw new TypeNarrowingError();
	return last.replace(/OrRef$/, "");
}

function serializeNodeInputs(nodeInputs: NodeInputMap): string {
	const nodeEntries = Object.entries(nodeInputs).map(([nodeType, params]) => {
		const paramEntries = Object.entries(params).map(
			([paramName, paramDef], i, arr) => {
				const comma = i < arr.length - 1 ? "," : "";
				return `    "${paramName}": ${JSON.stringify(paramDef, null, 2)
					.split("\n")
					.map((line, i) => (i === 0 ? line : `    ${line}`))
					.join("\n")} as const${comma}`;
			},
		);
		return `  "${nodeType}": {\n${paramEntries.join("\n")}\n  }`;
	});

	return `{\n${nodeEntries.join(",\n")}\n}`;
}

export function buildNodeInputs(schema: Schema): string {
	const nodeInputs: NodeInputMap = {};

	const sectionDefs: SectionDef[] = [
		schema.definitions.controlNode,
		schema.definitions.computeNode,
		schema.definitions.renderNode,
	];

	for (const sectionDef of sectionDefs) {
		for (const variant of sectionDef.oneOf) {
			const nodeType = variant.properties.type.enum[0];
			const params = variant.properties.params?.properties ?? {};

			nodeInputs[nodeType] = {};

			for (const [paramName, paramDef] of Object.entries(params)) {
				if (paramDef.$ref) {
					nodeInputs[nodeType][paramName] = {
						valueType: extractValueType(paramDef.$ref),
					};
				}
			}
		}
	}

	return `export const nodeInputs = ${serializeNodeInputs(nodeInputs)};\n`;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
	const outPath = resolve(
		import.meta.dirname,
		"../_generated/node-outputs-2.ts",
	);
	const valueKindsPath = resolve(
		import.meta.dirname,
		"../_generated/value-kinds-2.ts",
	);
	const inPath = resolve(import.meta.dirname, "../_generated/node-inputs-2.ts");

	const schema = await import("../schema/schema.json", {
		with: { type: "json" },
	});
	const valueKindsSchema = await import("../schema/value-kinds.schema.json", {
		with: { type: "json" },
	});

	const outputString = generateOutputs(
		schema.default as unknown as JSONSchema7,
	);
	const valueString = jsonSchemaValueKindsToTypeScript(valueKindsSchema);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const inputObj = buildNodeInputs(schema as any);

	writeFileSync(outPath, outputString);
	writeFileSync(valueKindsPath, valueString);
	writeFileSync(inPath, inputObj);
}
