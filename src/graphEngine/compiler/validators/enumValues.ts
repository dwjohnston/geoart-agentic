import type { GeoArtGraph } from "../../../schema/_generated/schema-types";
import type { LegacyComputeNodeDef } from "../../../graphEngine/externalInterfaces/ComputeNodeDefinition";
import type { LegacyRenderNodeDef } from "../../../graphEngine/externalInterfaces/RenderNodeDefinition";
import type { ValidationError } from "./types";
import { buildNodeMap } from "./_helpers";

type EnumPortDef = { name: string; type: string; options?: string[] };

export function validateEnumValues(graph: GeoArtGraph): ValidationError[] {
	const errors: ValidationError[] = [];
	const nodeMap = buildNodeMap(graph);

	const nodesWithParams = [...graph.compute.nodes, ...graph.render.nodes] as {
		id: string;
		params?: Record<string, unknown>;
	}[];

	for (const node of nodesWithParams) {
		const entry = nodeMap.get(node.id);
		if (!entry) continue;

		const inputs =
			"inputs" in entry.def
				? ((entry.def as LegacyComputeNodeDef | LegacyRenderNodeDef)
						.inputs as EnumPortDef[])
				: undefined;
		if (!inputs) continue;

		const params = (node.params ?? {}) as Record<string, unknown>;

		for (const portDef of inputs) {
			if (portDef.type !== "enum") continue;
			const { options } = portDef;
			if (!options || options.length === 0) continue;

			const param = params[portDef.name];
			if (!param || typeof param !== "object") continue;
			if ("ref" in param) continue; // dynamic refs are not validated here

			const envelope = param as { v?: unknown };
			if (typeof envelope.v !== "string") continue;

			if (!options.includes(envelope.v)) {
				errors.push({
					code: "INVALID_ENUM_VALUE",
					severity: "error",
					message: `Invalid enum value "${envelope.v}" for "${node.id}.${portDef.name}". Valid options: ${options.map((o) => `"${o}"`).join(", ")}`,
					nodeId: node.id,
					paramName: portDef.name,
				});
			}
		}
	}

	return errors;
}
