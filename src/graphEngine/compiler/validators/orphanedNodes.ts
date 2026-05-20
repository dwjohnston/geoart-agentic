import { TypeNarrowingError } from "../../../common-tooling/errors/TypeNarrowingError";
import type { GeoArtGraph } from "../../../schema/_generated/schema-types";
import { parseRefs } from "./_helpers";
import type { ValidationError } from "./types";

export function validateOrphanedNodes(graph: GeoArtGraph): ValidationError[] {
	const allNodeIds = [
		...graph.control.nodes.map((n) => n.id),
		...graph.compute.nodes.map((n) => n.id),
		...graph.render.nodes.map((n) => n.id),
	];

	const renderNodeIds = new Set(graph.render.nodes.map((n) => n.id));

	// An empty render layer is a valid starting state — no orphan warnings needed
	if (renderNodeIds.size === 0) return [];

	const edges = parseRefs(graph);

	// Build reverse adjacency: toNodeId → [fromNodeIds that feed into it]
	// Used for BFS backwards from render nodes
	const reverseAdj = new Map<string, string[]>();
	for (const id of allNodeIds) {
		reverseAdj.set(id, []);
	}
	for (const { fromNodeId, toNodeId } of edges) {
		reverseAdj.get(toNodeId)?.push(fromNodeId);
	}

	// BFS backwards from all render nodes
	const reachable = new Set<string>();
	const queue = [...renderNodeIds];
	while (queue.length > 0) {
		const nodeId = queue.shift();
		if (nodeId === undefined) throw new TypeNarrowingError();
		if (reachable.has(nodeId)) continue;
		reachable.add(nodeId);
		for (const upstream of reverseAdj.get(nodeId) ?? []) {
			if (!reachable.has(upstream)) queue.push(upstream);
		}
	}

	return allNodeIds
		.filter((id) => !reachable.has(id))
		.map((nodeId) => ({
			code: "ORPHANED_NODE",
			severity: "warning" as const,
			message: `Node "${nodeId}" has no path to any render node and will never affect the output`,
			nodeId,
		}));
}
