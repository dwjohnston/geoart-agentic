//🧽 Find a nice way of typing Json Schema objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonSchema = Record<string, any>;
function deriveKind(key: string): string {
    const stripped = key.endsWith('Value') ? key.slice(0, -'Value'.length) : key;
    return stripped.charAt(0).toLowerCase() + stripped.slice(1);
}

function schemaToTs(schema: JsonSchema, allDefs: Record<string, JsonSchema>): string {
    if (schema.$ref) {
        const refKey = schema.$ref.replace(/^#\/definitions\//, '');
        const refDef = allDefs[refKey];
        if (refDef?.properties?.v) {
            return schemaToTs(refDef.properties.v, allDefs);
        }
        return 'unknown';
    }

    const type = schema.type;

    if (type === 'number') return 'number';
    if (type === 'boolean') return 'boolean';

    if (type === 'string') {
        if (schema.enum) {
            return schema.enum.map((v: string) => `"${v}"`).join(' | ');
        }
        return 'string';
    }

    if (type === 'array') {
        const itemType = schema.items ? schemaToTs(schema.items, allDefs) : 'unknown';
        return `Array<${itemType}>`;
    }

    if (type === 'object' && schema.properties) {
        const fields = Object.entries(schema.properties as Record<string, JsonSchema>)
            .map(([k, v]) => `${k}: ${schemaToTs(v, allDefs)}`)
            .join('; ');
        return `{ ${fields} }`;
    }

    return 'unknown';
}

export function jsonSchemaValueKindsToTypeScript(schema: JsonSchema): string {
    const allDefs: Record<string, JsonSchema> = {
        ...(schema.definitions ?? {}),
    };
    for (const [key, val] of Object.entries(schema)) {
        if (!['$schema', 'title', 'description', 'definitions'].includes(key) && typeof val === 'object') {
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
        .filter(key => allDefs[key]?.properties?.v)
        .map(key => `V_${key}`)
        .join(' | ')
        };`;

    lines.push('');
    lines.push(unionLine);

    return lines.join('\n');
}
