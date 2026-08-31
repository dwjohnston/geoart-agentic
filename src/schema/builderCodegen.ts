/**
 * builderCodegen — converts a `GeoArtGraph` back into TypeScript source code
 * that uses `AlgorithmBuilder`. This is the inverse of what
 * `AlgorithmBuilder.construct()` produces, and backs a read-only
 * "view as TypeScript" panel in the app's Export JSON UI.
 *
 * See `src/schema/builder.ts` for the builder itself and its stage-ordering
 * rules (control → compute → render, with module nodes flexible in all
 * three stages).
 */
import type { GeoArtGraph, ControlNode, ComputeNode, RenderNode, ModuleNode } from "./_generated/schema-types";

type Layer = "control" | "compute" | "render" | "module";

interface GraphNode {
    id: string;
    layer: Layer;
    /** Original index within its own layer's array — used as a stable tiebreaker. */
    index: number;
    node: ControlNode | ComputeNode | RenderNode | ModuleNode;
    /** Ids of nodes this node's params refer to. */
    deps: string[];
}

const LAYER_RANK: Record<Exclude<Layer, "module">, number> = {
    control: 0,
    compute: 1,
    render: 2,
};

/**
 * Recursively scans a params object for any `{ ref: "nodeId.portName" }`
 * shape, at any depth (top-level port, or nested inside `{ v: [...] }`
 * arrays), and returns the set of referenced node ids.
 */
function collectRefDeps(value: unknown, deps: Set<string>): void {
    if (value === null || typeof value !== "object") {
        return;
    }

    if (Array.isArray(value)) {
        for (const item of value) {
            collectRefDeps(item, deps);
        }
        return;
    }

    const obj = value as Record<string, unknown>;
    if (typeof obj.ref === "string") {
        const dotIndex = obj.ref.indexOf(".");
        const nodeId = dotIndex === -1 ? obj.ref : obj.ref.slice(0, dotIndex);
        deps.add(nodeId);
        return;
    }

    for (const key of Object.keys(obj)) {
        collectRefDeps(obj[key], deps);
    }
}

function nodeParams(node: ControlNode | ComputeNode | RenderNode | ModuleNode): unknown {
    return (node as { params?: unknown }).params ?? {};
}

/**
 * Computes the effective rank of every node. Control/compute/render nodes
 * have a fixed rank (0/1/2). Module nodes take the max rank of their
 * (transitive) dependencies, defaulting to 0 if they have none. Resolved via
 * DFS with cycle detection.
 */
function computeEffectiveRanks(nodes: GraphNode[]): Map<string, number> {
    const byId = new Map<string, GraphNode>();
    for (const n of nodes) {
        byId.set(n.id, n);
    }

    const ranks = new Map<string, number>();
    const IN_PROGRESS = -1;

    function resolve(nodeId: string, path: string[]): number {
        const existing = ranks.get(nodeId);
        if (existing !== undefined) {
            if (existing === IN_PROGRESS) {
                throw new Error(
                    `graphToBuilderCode: cycle detected in node dependencies: ${[...path, nodeId].join(" -> ")}`
                );
            }
            return existing;
        }

        const gn = byId.get(nodeId);
        if (!gn) {
            // Dangling reference to a node id not present in the graph — treat
            // as having no bearing on rank.
            ranks.set(nodeId, 0);
            return 0;
        }

        if (gn.layer !== "module") {
            const rank = LAYER_RANK[gn.layer];
            ranks.set(nodeId, rank);
            return rank;
        }

        ranks.set(nodeId, IN_PROGRESS);
        let maxRank = 0;
        for (const depId of gn.deps) {
            const depRank = resolve(depId, [...path, nodeId]);
            if (depRank > maxRank) {
                maxRank = depRank;
            }
        }
        ranks.set(nodeId, maxRank);
        return maxRank;
    }

    for (const n of nodes) {
        resolve(n.id, []);
    }

    return ranks;
}

/**
 * Topologically sorts nodes within a single rank bucket so that any node
 * referenced by another node in the same bucket comes first. Falls back to
 * original array position (index) for determinism.
 */
function topoSortBucket(bucket: GraphNode[]): GraphNode[] {
    const idsInBucket = new Set(bucket.map(n => n.id));
    const sorted = [...bucket].sort((a, b) => a.index - b.index);

    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: GraphNode[] = [];
    const byId = new Map(sorted.map(n => [n.id, n]));

    function visit(n: GraphNode): void {
        if (visited.has(n.id)) return;
        if (visiting.has(n.id)) {
            throw new Error(`graphToBuilderCode: cycle detected while ordering nodes within a stage: ${n.id}`);
        }
        visiting.add(n.id);
        for (const depId of n.deps) {
            if (idsInBucket.has(depId)) {
                const depNode = byId.get(depId);
                if (depNode) {
                    visit(depNode);
                }
            }
        }
        visiting.delete(n.id);
        visited.add(n.id);
        result.push(n);
    }

    for (const n of sorted) {
        visit(n);
    }

    return result;
}

function methodNameForLayer(layer: Layer): string {
    switch (layer) {
        case "control":
            return "addControlNode";
        case "compute":
            return "addComputeNode";
        case "render":
            return "addRenderNode";
        case "module":
            return "addModuleNode";
    }
}

/** Pretty-prints a node's object literal, indented to sit under `.addXNode(...)`. */
function formatNodeCall(methodName: string, node: ControlNode | ComputeNode | RenderNode | ModuleNode): string {
    const json = JSON.stringify(node, null, 2);
    // Re-indent every line (after the first) by two extra spaces so the
    // object literal sits correctly under the chained `.addXNode(...)` call.
    const lines = json.split("\n");
    const indented = lines.map((line, i) => (i === 0 ? line : `  ${line}`)).join("\n");
    return `  .${methodName}(${indented})`;
}

function formatOptions(graph: GeoArtGraph): string {
    const options: Record<string, string> = {};
    if (graph.title !== undefined) options.title = graph.title;
    if (graph.author !== undefined) options.author = graph.author;
    if (graph.description !== undefined) options.description = graph.description;

    const keys = Object.keys(options);
    if (keys.length === 0) {
        return "new AlgorithmBuilder()";
    }

    const json = JSON.stringify(options, null, 2);
    return `new AlgorithmBuilder(${json})`;
}

/**
 * Converts a `GeoArtGraph` into TypeScript source code that reconstructs it
 * via `AlgorithmBuilder`. The emitted `.addXNode(...)` calls are ordered so
 * that the code type-checks against `AlgorithmBuilder`'s stage-ordering and
 * ref-validation constraints: control/compute/render nodes are emitted in
 * their fixed stage order, module nodes are emitted as early as their
 * dependencies allow, and within any stage a node referencing another node
 * in the same stage is emitted after it.
 */
export function graphToBuilderCode(graph: GeoArtGraph): string {
    const graphNodes: GraphNode[] = [];

    (graph.control?.nodes ?? []).forEach((node, index) => {
        const deps = new Set<string>();
        collectRefDeps(nodeParams(node), deps);
        graphNodes.push({ id: node.id, layer: "control", index, node, deps: [...deps] });
    });

    (graph.compute?.nodes ?? []).forEach((node, index) => {
        const deps = new Set<string>();
        collectRefDeps(nodeParams(node), deps);
        graphNodes.push({ id: node.id, layer: "compute", index, node, deps: [...deps] });
    });

    (graph.render?.nodes ?? []).forEach((node, index) => {
        const deps = new Set<string>();
        collectRefDeps(nodeParams(node), deps);
        graphNodes.push({ id: node.id, layer: "render", index, node, deps: [...deps] });
    });

    (graph.module?.nodes ?? []).forEach((node, index) => {
        const deps = new Set<string>();
        collectRefDeps(nodeParams(node), deps);
        graphNodes.push({ id: node.id, layer: "module", index, node, deps: [...deps] });
    });

    const ranks = computeEffectiveRanks(graphNodes);

    const buckets: GraphNode[][] = [[], [], []];
    for (const n of graphNodes) {
        const rank = ranks.get(n.id) ?? 0;
        buckets[rank].push(n);
    }

    const calls: string[] = [];
    for (const bucket of buckets) {
        const ordered = topoSortBucket(bucket);
        for (const n of ordered) {
            calls.push(formatNodeCall(methodNameForLayer(n.layer), n.node));
        }
    }

    const head = formatOptions(graph);
    if (calls.length === 0) {
        return `${head}.construct();`;
    }

    return `${head}\n${calls.join("\n")}\n  .construct();`;
}
