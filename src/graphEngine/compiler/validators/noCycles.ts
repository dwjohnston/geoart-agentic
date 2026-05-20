import { TypeNarrowingError } from "../../../common-tooling/errors/TypeNarrowingError";
import type { GeoArtGraph } from "../../../schema/_generated/schema-types";
import { parseRefs } from "./_helpers";
import type { ValidationError } from "./types";

export function validateNoCycles(graph: GeoArtGraph): ValidationError[] {
	const allNodeIds = [
		...graph.control.nodes.map((n) => n.id),
		...graph.compute.nodes.map((n) => n.id),
		...graph.render.nodes.map((n) => n.id),
	];

	const edges = parseRefs(graph);

	// Kahn's algorithm — same approach as compiler.ts:topologicalSort
	const inDegree = new Map<string, number>();
	const dependants = new Map<string, string[]>(); // node → nodes that depend on it

	for (const id of allNodeIds) {
		inDegree.set(id, 0);
		dependants.set(id, []);
	}

	for (const { fromNodeId, toNodeId } of edges) {
		// Skip edges that reference unknown nodes — those are caught by validateRefs
		if (!inDegree.has(fromNodeId) || !inDegree.has(toNodeId)) continue;
		inDegree.set(toNodeId, (inDegree.get(toNodeId) ?? 0) + 1);
		const nodeDeps = dependants.get(fromNodeId);
		if (!nodeDeps) throw new TypeNarrowingError();
		nodeDeps.push(toNodeId);
	}

	const queue: string[] = [];
	for (const [id, deg] of inDegree.entries()) {
		if (deg === 0) queue.push(id);
	}

	const sorted: string[] = [];
	while (queue.length > 0) {
		const id = queue.shift();
		if (id === undefined) throw new TypeNarrowingError();
		sorted.push(id);
		for (const dep of dependants.get(id) ?? []) {
			const newDeg = (inDegree.get(dep) ?? 1) - 1;
			inDegree.set(dep, newDeg);
			if (newDeg === 0) queue.push(dep);
		}
	}

	if (sorted.length === allNodeIds.length) return [];

	// Any node that could not be sorted is part of a cycle
	const sortedSet = new Set(sorted);
	return allNodeIds
		.filter((id) => !sortedSet.has(id))
		.map((nodeId) => ({
			code: "CYCLE_DETECTED",
			severity: "error" as const,
			message: `Node "${nodeId}" is part of a cycle`,
			nodeId,
		}));
}
