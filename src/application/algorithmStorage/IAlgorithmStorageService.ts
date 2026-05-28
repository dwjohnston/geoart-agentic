import type { GeoArtGraph } from '../../schema/_generated/schema-types';

export type StoredAlgorithmEntry = {
  id: string;
  name: string;
  graph: GeoArtGraph;
};

export interface IAlgorithmStorageService {
  saveAlgorithm(algorithm: GeoArtGraph): Promise<StoredAlgorithmEntry>;
  listSavedAlgorithms(): Promise<StoredAlgorithmEntry[]>;
  getSavedAlgorithm(id: string): Promise<GeoArtGraph>;
}
