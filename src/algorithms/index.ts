
import type { GeoArtGraph } from '../schema/_generated/schema-types';

export type GraphEntry = {
  id: string;
  name: string;
  graph: GeoArtGraph;
};

type GraphModule = { default: GeoArtGraph };

const modules = import.meta.glob<GraphModule>('./reference/**/*.ts', { eager: true });

function filePathToId(filePath: string): string {
  const filename = filePath.split('/').pop()!.replace(/\.ts$/, '').replace(/ReferenceGraph$/, '');
  return filename.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export const GRAPHS: GraphEntry[] = Object.entries(modules).map(([filePath, module]) => {
  const graph = module.default;
  const id = filePathToId(filePath);
  return { id, name: graph.title ?? id, graph };
});

export const DEFAULT_GRAPH_ID = GRAPHS[0].id;

export function getGraph(id: string): GraphEntry {
  const entry = GRAPHS.find(g => g.id === id);
  if (!entry) throw new Error(`Unknown graph id: ${id}`);
  return entry;
}
