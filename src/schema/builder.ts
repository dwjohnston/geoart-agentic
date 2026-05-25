import type { GeoArtGraph } from "./_generated/schema-types";

export class AlgorithmBuilder {
    public construct(): GeoArtGraph {
        return {
            version: '2.0',
            control: { nodes: [] },
            compute: { nodes: [] },
            render: { nodes: [] },
        };
    }
}