import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import type { IAlgorithmStorageService, StoredAlgorithmEntry } from './IAlgorithmStorageService';

const STORAGE_KEY = 'geoart:imported-algorithms';

export class LocalStorageAlgorithmStorageService implements IAlgorithmStorageService {
  async saveAlgorithm(algorithm: GeoArtGraph): Promise<StoredAlgorithmEntry> {
    const existing = await this.listSavedAlgorithms();
    const id = `imported-${Date.now()}`;
    const entry: StoredAlgorithmEntry = {
      id,
      name: algorithm.title ?? id,
      graph: algorithm,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, entry]));
    return entry;
  }

  async listSavedAlgorithms(): Promise<StoredAlgorithmEntry[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as StoredAlgorithmEntry[];
    } catch {
      return [];
    }
  }

  async getSavedAlgorithm(id: string): Promise<GeoArtGraph> {
    const entries = await this.listSavedAlgorithms();
    const entry = entries.find(e => e.id === id);
    if (!entry) throw new Error(`Algorithm not found: ${id}`);
    return entry.graph;
  }
}
