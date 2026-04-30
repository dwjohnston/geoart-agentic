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
    return ref.split('/').pop()!.replace(/OrRef$/, '');
}

function serializeNodeInputs(nodeInputs: NodeInputMap): string {
    const nodeEntries = Object.entries(nodeInputs).map(([nodeType, params]) => {
        const paramEntries = Object.entries(params).map(([paramName, paramDef], i, arr) => {
            const comma = i < arr.length - 1 ? ',' : '';
            return `    "${paramName}": ${JSON.stringify(paramDef, null, 2)
                .split('\n')
                .map((line, i) => (i === 0 ? line : `    ${line}`))
                .join('\n')} as const${comma}`;
        });
        return `  "${nodeType}": {\n${paramEntries.join('\n')}\n  }`;
    });

    return `{\n${nodeEntries.join(',\n')}\n}`;
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