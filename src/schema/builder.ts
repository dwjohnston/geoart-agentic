import type { GeoArtGraph, ControlNode, ComputeNode, RenderNode } from "./_generated/schema-types";

interface AlgorithmBuilderOptions {
    title?: string;
    author?: string;
    description?: string;
}

type BuilderStage = 'control' | 'compute' | 'render';

export class AlgorithmBuilder<Stage extends BuilderStage = 'control'> {
    private readonly options: AlgorithmBuilderOptions;
    private readonly controlNodes: ControlNode[] = [];
    private readonly computeNodes: ComputeNode[] = [];
    private readonly renderNodes: RenderNode[] = [];

    constructor(options: AlgorithmBuilderOptions = {}) {
        this.options = options;
    }

    public addControlNode(node: ControlNode): [Stage] extends ['control'] ? AlgorithmBuilder<'control'> : never {
        this.controlNodes.push(node);
        return this as never;
    }

    public addComputeNode(node: ComputeNode): [Stage] extends ['render'] ? never : AlgorithmBuilder<'compute'> {
        this.computeNodes.push(node);
        return this as never;
    }

    public addRenderNode(node: RenderNode): AlgorithmBuilder<'render'> {
        this.renderNodes.push(node);
        return this as never;
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