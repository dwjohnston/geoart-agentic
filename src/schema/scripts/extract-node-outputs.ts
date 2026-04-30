import type { JSONSchema7 } from "json-schema";


type NodeOutputEntry = { name: string; valueType: string };


type NodeDef = {
  "x-outputs"?: NodeOutputEntry[];
  properties?: {
    type?: { enum?: string[] };
  };
};



export function generateOutputs(schema: JSONSchema7): string {
  const definitions = schema["definitions"] as Record<string, { oneOf?: NodeDef[] }>;

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
    lines.push(`  ${JSON.stringify(typeKey)}: ${JSON.stringify(outputs)} as const,`);
  }

  lines.push("} as const;");
  lines.push("");

  return lines.join("\n")
}







