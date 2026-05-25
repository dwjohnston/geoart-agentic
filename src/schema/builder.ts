import type { GeoArtGraph, ControlNode, ComputeNode, RenderNode } from "./_generated/schema-types";

interface AlgorithmBuilderOptions {
    title?: string;
    author?: string;
    description?: string;
}

interface ControlStageBuilder {
    addControlNode(node: ControlNode): ControlStageBuilder;
    addComputeNode(node: ComputeNode): ComputeStageBuilder;
    addRenderNode(node: RenderNode): RenderStageBuilder;
    construct(): GeoArtGraph;
}

interface ComputeStageBuilder {
    addComputeNode(node: ComputeNode): ComputeStageBuilder;
    addRenderNode(node: RenderNode): RenderStageBuilder;
    construct(): GeoArtGraph;
}

interface RenderStageBuilder {
    addRenderNode(node: RenderNode): RenderStageBuilder;
    construct(): GeoArtGraph;
}

export class AlgorithmBuilder implements ControlStageBuilder {
    private readonly options: AlgorithmBuilderOptions;
    private readonly controlNodes: ControlNode[] = [];
    private readonly computeNodes: ComputeNode[] = [];
    private readonly renderNodes: RenderNode[] = [];

    constructor(options: AlgorithmBuilderOptions = {}) {
        this.options = options;
    }

    public addControlNode(node: ControlNode): ControlStageBuilder {
        this.controlNodes.push(node);
        return this;
    }

    public addComputeNode(node: ComputeNode): ComputeStageBuilder {
        this.computeNodes.push(node);
        return this;
    }

    public addRenderNode(node: RenderNode): RenderStageBuilder {
        this.renderNodes.push(node);
        return this;
    }

    public construct(): GeoArtGraph {
        return {
            version: '2.0',
            ...this.options,
            control: { nodes: [...this.controlNodes] },
            compute: { nodes: [...this.computeNodes] },
            render: { nodes: [...this.renderNodes] },
        };
    }
}