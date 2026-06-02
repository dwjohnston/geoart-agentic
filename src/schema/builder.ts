/**
 * AlgorithmBuilder — fluent builder for declaring GeoArt algorithms in TypeScript.
 *
 * ## Layer ordering
 * Nodes must be added in layer order: control → compute → render.
 * This is enforced at the type level via three stage interfaces:
 *   - ControlStageBuilder  — exposes all three addXNode methods
 *   - ComputeStageBuilder  — exposes addComputeNode and addRenderNode only
 *   - RenderStageBuilder   — exposes addRenderNode only
 * Each addXNode method returns the appropriate stage interface, so calling
 * an out-of-order method (e.g. addControlNode after addComputeNode) is a
 * compile-time error on the call itself rather than a cascading never error.
 *
 * ## Ref validation
 * Each stage builder carries an `Acc` type parameter — a union of
 * { nodeType, nodeId } entries for every node declared so far. As nodes are
 * added, Acc grows. Ref strings in params are constrained to ports that
 * actually exist on prior nodes and whose output type matches the input port.
 */
import type { GeoArtGraph, ControlNode, ComputeNode, RenderNode, ModuleNode, RenderLayerConfig } from "./_generated/schema-types";
import type {
    NodeAccumulator,
    ConstrainedNodeInputsDeclared,
    ControlNodeKinds,
    ComputeNodeKinds,
    RenderNodeKinds,
    ModuleNodeKinds,
} from "./typeHelpers";

interface AlgorithmBuilderOptions {
    title?: string;
    author?: string;
    description?: string;
}

type ConstrainedControlNode<K extends ControlNodeKinds, Id extends string, Acc extends NodeAccumulator> = {
    id: Id;
    type: K;
    params: ConstrainedNodeInputsDeclared<K, Acc>;
};

type ConstrainedComputeNode<K extends ComputeNodeKinds, Id extends string, Acc extends NodeAccumulator> = {
    id: Id;
    type: K;
    params: ConstrainedNodeInputsDeclared<K, Acc>;
};

type ConstrainedRenderNode<K extends RenderNodeKinds, Id extends string, Acc extends NodeAccumulator> = {
    id: Id;
    type: K;
    renderConfig: RenderLayerConfig;
    params: ConstrainedNodeInputsDeclared<K, Acc>;
};

type ConstrainedModuleNode<K extends ModuleNodeKinds, Id extends string, Acc extends NodeAccumulator> = {
    id: Id;
    type: K;
    params: ConstrainedNodeInputsDeclared<K, Acc>;
};

interface ControlStageBuilder<Acc extends NodeAccumulator> {
    addControlNode<K extends ControlNodeKinds, Id extends string>(
        node: ConstrainedControlNode<K, Id, Acc>
    ): ControlStageBuilder<Acc | { nodeType: K; nodeId: Id }>;
    addComputeNode<K extends ComputeNodeKinds, Id extends string>(
        node: ConstrainedComputeNode<K, Id, Acc>
    ): ComputeStageBuilder<Acc | { nodeType: K; nodeId: Id }>;
    addRenderNode<K extends RenderNodeKinds, Id extends string>(
        node: ConstrainedRenderNode<K, Id, Acc>
    ): RenderStageBuilder<Acc | { nodeType: K; nodeId: Id }>;
    addModuleNode<K extends ModuleNodeKinds, Id extends string>(
        node: ConstrainedModuleNode<K, Id, Acc>
    ): ControlStageBuilder<Acc | { nodeType: K; nodeId: Id }>;
    construct(): GeoArtGraph;
}

interface ComputeStageBuilder<Acc extends NodeAccumulator> {
    addComputeNode<K extends ComputeNodeKinds, Id extends string>(
        node: ConstrainedComputeNode<K, Id, Acc>
    ): ComputeStageBuilder<Acc | { nodeType: K; nodeId: Id }>;
    addRenderNode<K extends RenderNodeKinds, Id extends string>(
        node: ConstrainedRenderNode<K, Id, Acc>
    ): RenderStageBuilder<Acc | { nodeType: K; nodeId: Id }>;
    addModuleNode<K extends ModuleNodeKinds, Id extends string>(
        node: ConstrainedModuleNode<K, Id, Acc>
    ): ComputeStageBuilder<Acc | { nodeType: K; nodeId: Id }>;
    construct(): GeoArtGraph;
}

interface RenderStageBuilder<Acc extends NodeAccumulator> {
    addRenderNode<K extends RenderNodeKinds, Id extends string>(
        node: ConstrainedRenderNode<K, Id, Acc>
    ): RenderStageBuilder<Acc | { nodeType: K; nodeId: Id }>;
    addModuleNode<K extends ModuleNodeKinds, Id extends string>(
        node: ConstrainedModuleNode<K, Id, Acc>
    ): RenderStageBuilder<Acc | { nodeType: K; nodeId: Id }>;
    construct(): GeoArtGraph;
}

export class AlgorithmBuilder implements ControlStageBuilder<never> {
    private readonly options: AlgorithmBuilderOptions;
    private readonly moduleNodes: ModuleNode[] = [];
    private readonly controlNodes: ControlNode[] = [];
    private readonly computeNodes: ComputeNode[] = [];
    private readonly renderNodes: RenderNode[] = [];

    constructor(options: AlgorithmBuilderOptions = {}) {
        this.options = options;
    }

    public addControlNode<K extends ControlNodeKinds, Id extends string>(
        node: ConstrainedControlNode<K, Id, never>
    ): ControlStageBuilder<{ nodeType: K; nodeId: Id }> {
        this.controlNodes.push(node as ControlNode);
        return this as unknown as ControlStageBuilder<{ nodeType: K; nodeId: Id }>;
    }

    public addComputeNode<K extends ComputeNodeKinds, Id extends string>(
        node: ConstrainedComputeNode<K, Id, never>
    ): ComputeStageBuilder<{ nodeType: K; nodeId: Id }> {
        this.computeNodes.push(node as ComputeNode);
        return this as unknown as ComputeStageBuilder<{ nodeType: K; nodeId: Id }>;
    }

    public addRenderNode<K extends RenderNodeKinds, Id extends string>(
        node: ConstrainedRenderNode<K, Id, never>
    ): RenderStageBuilder<{ nodeType: K; nodeId: Id }> {
        this.renderNodes.push(node as RenderNode);
        return this as unknown as RenderStageBuilder<{ nodeType: K; nodeId: Id }>;
    }

    public addModuleNode<K extends ModuleNodeKinds, Id extends string>(
        node: ConstrainedModuleNode<K, Id, never>
    ): ControlStageBuilder<{ nodeType: K; nodeId: Id }> {
        this.moduleNodes.push(node as ModuleNode);
        return this as unknown as ControlStageBuilder<{ nodeType: K; nodeId: Id }>;
    }

    public construct(): GeoArtGraph {
        const graph: GeoArtGraph = {
            version: '2.0',
            ...this.options,
            control: { nodes: [...this.controlNodes] },
            compute: { nodes: [...this.computeNodes] },
            render: { nodes: [...this.renderNodes] },
        };

        if (this.moduleNodes.length > 0) {
            graph.module = { nodes: [...this.moduleNodes] };
        }

        return graph;
    }
}
