import type { GeoArtGraph, ControlNode, ComputeNode, RenderNode } from "./_generated/schema-types";

interface AlgorithmBuilderOptions {
    title?: string;
    author?: string;
    description?: string;
}

export class AlgorithmBuilder {
    private readonly options: AlgorithmBuilderOptions;
    private readonly controlNodes: ControlNode[] = [];
    private readonly computeNodes: ComputeNode[] = [];
    private readonly renderNodes: RenderNode[] = [];

    constructor(options: AlgorithmBuilderOptions = {}) {
        this.options = options;
    }

    public addControlNode(node: ControlNode): this {
        this.controlNodes.push(node);
        return this;
    }

    public addComputeNode(node: ComputeNode): this {
        this.computeNodes.push(node);
        return this;
    }

    public addRenderNode(node: RenderNode): this {
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