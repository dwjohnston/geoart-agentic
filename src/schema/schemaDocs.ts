/**
 * Derives a documentation model from the JSON schema files so the UI can
 * render reference docs (node types, params, outputs, value kinds) without
 * anything being hand-maintained — every entry here traces back to
 * `schema.json` / `value-kinds.schema.json`.
 */
import schemaJson from "./schema/schema.json";
import valueKindsJson from "./schema/value-kinds.schema.json";

// Loose view of the JSON-schema subset this module reads. The real files
// are far richer; only the keywords used for docs are typed here.
export type JsonSchemaNode = {
    title?: string;
    description?: string;
    type?: string | string[];
    enum?: string[];
    deprecated?: boolean;
    required?: string[];
    properties?: Record<string, JsonSchemaNode>;
    items?: JsonSchemaNode;
    oneOf?: JsonSchemaNode[];
    $ref?: string;
    minimum?: number;
    maximum?: number;
    pattern?: string;
    "x-outputs"?: { name: string; valueType: string }[];
    definitions?: Record<string, JsonSchemaNode>;
};

export type NodeSection = "control" | "compute" | "render" | "module";

export type ParamDoc = {
    name: string;
    /** Value kind name as used in value-kinds.schema.json, e.g. `numberValue`. */
    valueKind: string;
    /** Whether the param also accepts `{ ref: 'nodeId.port' }`. */
    refable: boolean;
    required: boolean;
    deprecated: boolean;
    description?: string;
};

export type OutputDoc = { name: string; valueType: string };

export type NodeDoc = {
    section: NodeSection;
    title: string;
    /** The `type` discriminator value, e.g. `slider`. */
    type: string;
    description?: string;
    deprecated: boolean;
    hasRenderConfig: boolean;
    params: ParamDoc[];
    outputs: OutputDoc[];
};

export type SectionDoc = {
    key: NodeSection;
    title: string;
    description?: string;
    nodes: NodeDoc[];
};

export type FieldDoc = {
    name: string;
    title?: string;
    description?: string;
    /** Human-readable type summary, e.g. `number`, `"paint" | "live"`. */
    type: string;
    required: boolean;
    /** Nested object fields, when `type` is an object. */
    fields?: FieldDoc[];
};

export type ValueKindDoc = {
    name: string;
    title?: string;
    description?: string;
    /** Human-readable summary of the `v` payload shape. */
    shape: string;
    enumValues?: string[];
    fields?: FieldDoc[];
    /** Runtime-only kinds cannot be written statically; only refs work. */
    staticAllowed: boolean;
};

export type SchemaDocs = {
    title: string;
    description?: string;
    graphFields: FieldDoc[];
    sections: SectionDoc[];
    renderConfigFields: FieldDoc[];
    valueKinds: ValueKindDoc[];
};

const SECTION_ORDER: { key: NodeSection; definition: string }[] = [
    { key: "control", definition: "controlNode" },
    { key: "compute", definition: "computeNode" },
    { key: "render", definition: "renderNode" },
    { key: "module", definition: "moduleNode" },
];

const REFABLE_SUFFIX = "OrRef";

/**
 * Resolves a param `$ref` like
 * `refable-value-kinds.schema.json#/definitions/numberValueOrRef` to its base
 * value kind and whether it accepts a ref.
 */
export function parseParamRef(ref: string): { valueKind: string; refable: boolean } {
    const name = refName(ref);
    if (name.endsWith(REFABLE_SUFFIX)) {
        return { valueKind: name.slice(0, -REFABLE_SUFFIX.length), refable: true };
    }
    return { valueKind: name, refable: false };
}

/** `type` may be a single name or a union like `["number", "null"]`. */
function primaryType(node: JsonSchemaNode): string | undefined {
    if (Array.isArray(node.type)) return node.type.find(t => t !== "null") ?? node.type[0];
    return node.type;
}

function isNullable(node: JsonSchemaNode): boolean {
    return Array.isArray(node.type) && node.type.includes("null");
}

function describeType(node: JsonSchemaNode, definitions: Record<string, JsonSchemaNode>): string {
    if (node.$ref) {
        const target = resolveLocalRef(node.$ref, definitions);
        if (!target) return node.$ref;
        // A ref to a value kind (a `{ v }` wrapper) is best named, not
        // expanded — e.g. array items are whole `colorPointValue`s.
        return isValueKindWrapper(target) ? refName(node.$ref) : describeType(target, definitions);
    }
    if (node.enum) return node.enum.map(v => JSON.stringify(v)).join(" | ");
    const type = primaryType(node);
    let summary: string;
    if (type === "array") {
        summary = `${node.items ? describeType(node.items, definitions) : "unknown"}[]`;
    } else if (type === "object") {
        summary = "object";
    } else if (type === "number") {
        const bounds: string[] = [];
        if (node.minimum !== undefined) bounds.push(`≥ ${node.minimum}`);
        if (node.maximum !== undefined) bounds.push(`≤ ${node.maximum}`);
        summary = bounds.length ? `number (${bounds.join(", ")})` : "number";
    } else {
        summary = type ?? "unknown";
    }
    return isNullable(node) ? `${summary} | null` : summary;
}

/**
 * Follows a `#/definitions/<name>` (or `<file>#/definitions/<name>`) ref
 * within the given definitions.
 */
function resolveLocalRef(ref: string, definitions: Record<string, JsonSchemaNode>): JsonSchemaNode | undefined {
    return definitions[refName(ref)];
}

/** Value-kind definitions wrap their payload as `{ v: … }`. */
function isValueKindWrapper(node: JsonSchemaNode): boolean {
    return node.properties?.v !== undefined;
}

function refName(ref: string): string {
    return ref.slice(ref.lastIndexOf("/") + 1);
}

function objectFields(node: JsonSchemaNode, definitions: Record<string, JsonSchemaNode>): FieldDoc[] {
    const required = new Set(node.required ?? []);
    return Object.entries(node.properties ?? {}).map(([name, prop]) => {
        const resolved = prop.$ref ? (resolveLocalRef(prop.$ref, definitions) ?? prop) : prop;
        const field: FieldDoc = {
            name,
            title: resolved.title,
            description: prop.description ?? resolved.description,
            type: describeType(resolved, definitions),
            required: required.has(name),
        };
        if (resolved.type === "object" && resolved.properties) {
            field.fields = objectFields(resolved, definitions);
        }
        return field;
    });
}

function buildNodeDoc(section: NodeSection, variant: JsonSchemaNode): NodeDoc {
    const type = variant.properties?.type?.enum?.[0] ?? "?";
    const params = variant.properties?.params ?? {};
    const requiredParams = new Set(params.required ?? []);

    const paramDocs: ParamDoc[] = Object.entries(params.properties ?? {}).map(([name, p]) => {
        const { valueKind, refable } = p.$ref
            ? parseParamRef(p.$ref)
            : { valueKind: primaryType(p) ?? "unknown", refable: false };
        return {
            name,
            valueKind,
            refable,
            required: requiredParams.has(name),
            deprecated: p.deprecated === true,
            description: p.description,
        };
    });

    return {
        section,
        title: variant.title ?? type,
        type,
        description: variant.description,
        deprecated: variant.deprecated === true,
        hasRenderConfig: variant.properties?.renderConfig !== undefined,
        params: paramDocs,
        outputs: (variant["x-outputs"] ?? []).map(o => ({ name: o.name, valueType: o.valueType })),
    };
}

function buildValueKindDoc(name: string, def: JsonSchemaNode, definitions: Record<string, JsonSchemaNode>): ValueKindDoc {
    const payload = def.properties?.v ?? {};
    const doc: ValueKindDoc = {
        name,
        title: def.title,
        description: def.description,
        shape: describeType(payload, definitions),
        staticAllowed: !/runtime-only/i.test(def.description ?? ""),
    };
    if (payload.enum) doc.enumValues = payload.enum;
    if (payload.type === "object" && payload.properties) {
        doc.fields = objectFields(payload, definitions);
    }
    return doc;
}

// The imported JSON gets a very precise literal type from TypeScript that
// doesn't structurally line up with the loose `JsonSchemaNode` view (optional
// keys inferred as `undefined`), hence the `unknown` hop.
const DEFAULT_SCHEMA = schemaJson as unknown as JsonSchemaNode;
const DEFAULT_VALUE_KINDS = valueKindsJson as unknown as JsonSchemaNode;

export function buildSchemaDocs(schema: JsonSchemaNode = DEFAULT_SCHEMA, valueKinds: JsonSchemaNode = DEFAULT_VALUE_KINDS): SchemaDocs {
    const definitions = schema.definitions ?? {};
    const valueDefinitions = valueKinds.definitions ?? {};

    const sections: SectionDoc[] = SECTION_ORDER.flatMap(({ key, definition }) => {
        const sectionSchema = schema.properties?.[key];
        const nodeDefinition = definitions[definition];
        if (!sectionSchema || !nodeDefinition) return [];
        return [
            {
                key,
                title: sectionSchema.title ?? key,
                description: sectionSchema.description,
                nodes: (nodeDefinition.oneOf ?? []).map(variant => buildNodeDoc(key, variant)),
            },
        ];
    });

    const sectionKeys = new Set<string>(SECTION_ORDER.map(s => s.key));
    const graphFields = objectFields(schema, definitions).filter(f => !sectionKeys.has(f.name));

    const renderConfig = definitions.renderConfig;

    return {
        title: schema.title ?? "Schema",
        description: schema.description,
        graphFields,
        sections,
        renderConfigFields: renderConfig ? objectFields(renderConfig, definitions) : [],
        valueKinds: Object.entries(valueDefinitions).map(([name, def]) => buildValueKindDoc(name, def, valueDefinitions)),
    };
}

// ---------------------------------------------------------------------------
// Example snippets
// ---------------------------------------------------------------------------

export type SnippetFormat = "json" | "typescript";

type ExampleValue = number | string | boolean | ExampleValue[] | { [key: string]: ExampleValue };

/**
 * Produces a plausible placeholder for a value-kinds payload schema by walking
 * its structure: numbers → 1, enums → first member, objects → required fields.
 */
function exampleForPayload(node: JsonSchemaNode, definitions: Record<string, JsonSchemaNode>, depth = 0): ExampleValue {
    if (depth > 6) return "…";
    if (node.$ref) {
        const target = resolveLocalRef(node.$ref, definitions);
        return target ? exampleForPayload(target, definitions, depth + 1) : "…";
    }
    if (node.enum) return node.enum[0] ?? "";
    switch (primaryType(node)) {
        case "number": {
            const min = node.minimum ?? 0;
            const max = node.maximum;
            return max !== undefined && max < 1 ? max : Math.max(min, 1);
        }
        case "string":
            return "text";
        case "boolean":
            return true;
        case "array":
            return node.items ? [exampleForPayload(node.items, definitions, depth + 1)] : [];
        case "object": {
            const required = new Set(node.required ?? []);
            const out: { [key: string]: ExampleValue } = {};
            for (const [key, prop] of Object.entries(node.properties ?? {})) {
                if (required.has(key)) out[key] = exampleForPayload(prop, definitions, depth + 1);
            }
            return out;
        }
        default:
            return "…";
    }
}

export function exampleParamValue(param: ParamDoc, valueKinds: JsonSchemaNode = DEFAULT_VALUE_KINDS): ExampleValue {
    const definitions = valueKinds.definitions ?? {};
    const def = definitions[param.valueKind];
    const staticAllowed = def ? !/runtime-only/i.test(def.description ?? "") : true;
    if (!staticAllowed || !def?.properties?.v) {
        return { ref: "nodeId.port" };
    }
    return { v: exampleForPayload(def.properties.v, definitions) };
}

/** Serialises a value as either strict JSON or a TypeScript object literal. */
export function formatLiteral(value: ExampleValue, format: SnippetFormat, indent = 0): string {
    const pad = "  ".repeat(indent);
    const padIn = "  ".repeat(indent + 1);
    if (Array.isArray(value)) {
        if (value.length === 0) return "[]";
        const inline = value.every(v => typeof v !== "object");
        if (inline) return `[${value.map(v => formatLiteral(v, format, indent + 1)).join(", ")}]`;
        return `[\n${value.map(v => padIn + formatLiteral(v, format, indent + 1)).join(",\n")}\n${pad}]`;
    }
    if (typeof value === "object") {
        const entries = Object.entries(value);
        if (entries.length === 0) return "{}";
        const inline = entries.every(([, v]) => typeof v !== "object") && entries.length <= 4;
        const key = (k: string) => (format === "json" ? JSON.stringify(k) : k);
        if (inline) {
            return `{ ${entries.map(([k, v]) => `${key(k)}: ${formatLiteral(v, format, indent + 1)}`).join(", ")} }`;
        }
        return `{\n${entries.map(([k, v]) => `${padIn}${key(k)}: ${formatLiteral(v, format, indent + 1)}`).join(",\n")}\n${pad}}`;
    }
    if (typeof value === "string") {
        return format === "json" ? JSON.stringify(value) : `'${value.replace(/'/g, "\\'")}'`;
    }
    return String(value);
}

const BUILDER_METHOD: Record<NodeSection, string> = {
    control: "addControlNode",
    compute: "addComputeNode",
    render: "addRenderNode",
    module: "addModuleNode",
};

/** A complete example node declaration in the requested format. */
export function nodeExample(node: NodeDoc, format: SnippetFormat): string {
    const params: { [key: string]: ExampleValue } = {};
    for (const p of node.params) {
        if (p.deprecated) continue;
        params[p.name] = exampleParamValue(p);
    }
    const literal: { [key: string]: ExampleValue } = { id: `my${capitalise(node.type)}`, type: node.type };
    if (node.hasRenderConfig) literal.renderConfig = { layer: "live" };
    literal.params = params;

    if (format === "json") return formatLiteral(literal, "json");
    return `.${BUILDER_METHOD[node.section]}(${formatLiteral(literal, "typescript")})`;
}

function capitalise(s: string): string {
    const cleaned = s.replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase());
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/** Skeleton of a whole algorithm in the requested format. */
export function graphSkeletonExample(format: SnippetFormat): string {
    if (format === "json") {
        return formatLiteral(
            {
                version: "2.0",
                title: "My Algorithm",
                control: { nodes: [] },
                compute: { nodes: [] },
                render: { nodes: [] },
            },
            "json"
        );
    }
    return [
        "new AlgorithmBuilder({ title: 'My Algorithm' })",
        "  .addControlNode({ /* … */ })",
        "  .addComputeNode({ /* … */ })",
        "  .addRenderNode({ /* … */ })",
        "  .construct();",
    ].join("\n");
}
