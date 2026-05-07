
function fixInternalRefs(obj: Record<string, unknown> | unknown[], currentDepth = 0): Record<string, unknown> | unknown[] {
    if (currentDepth > 10) return obj;
    if (obj === null || typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
        return obj.map((item) => fixInternalRefs(item as Record<string, unknown> | unknown[], currentDepth + 1));
    }

    const result = { ...(obj as Record<string, unknown>) };

    if (result.$ref && typeof result.$ref === "string" && result.$ref.startsWith("#/definitions/")) {
        result.$ref = `value-kinds.schema.json${result.$ref}`;
    }

    for (const key of Object.keys(result)) {
        result[key] = fixInternalRefs(result[key] as Record<string, unknown> | unknown[], currentDepth + 1);
    }

    return result;
}

// 🧽 Find a nice way of typing Json Schema objects
// ignoring this for now
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractDerviedSchema(schema: any) {
    const definitions: Record<string, object> = {};


    const refParamRef = { $ref: "schema.json#/definitions/refParam" };

    for (const defName of Object.keys(schema.definitions)) {
        const def = schema.definitions[defName];

        // Check if this is an array type
        const isArrayType = def.properties?.v?.type === "array";

        if (isArrayType) {
            // For array types, items can be either the base item type or a ref
            const baseItemRef = def.properties.v.items;
            const orRefDef = JSON.parse(JSON.stringify(def)); // Deep clone

            // Fix internal $refs to point to value-kinds.schema.json
            orRefDef.properties.v.items = {
                oneOf: [
                    fixInternalRefs(baseItemRef),
                    refParamRef,
                ],
            };

            definitions[`${defName}OrRef`] = {
                title: `${def.title} Or Ref`,
                oneOf: [
                    fixInternalRefs(orRefDef),
                    refParamRef,
                ],
            };
        } else {
            // For non-array types, use simple approach
            definitions[`${defName}OrRef`] = {
                title: `${def.title} Or Ref`,
                oneOf: [
                    { $ref: `value-kinds.schema.json#/definitions/${defName}` },
                    refParamRef,
                ],
            };
        }
    }

    const output = {
        $schema: "https://json-schema.org/draft/2019-09/schema",
        title: "GeoArt Refable Value Kinds",
        description: "Param-level definitions: each value kind as either a static value or a ref to another node's output",
        definitions,
    };
    return output
}