import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import { App } from './App';
import { AlgorithmStorageProvider } from './algorithmStorage/AlgorithmStorageContext';
import type { IAlgorithmStorageService, StoredAlgorithmEntry } from './algorithmStorage/IAlgorithmStorageService';
import type { GeoArtGraph } from '../schema/_generated/schema-types';

const stubStorageService: IAlgorithmStorageService = {
  saveAlgorithm: async (_: GeoArtGraph): Promise<StoredAlgorithmEntry> => {
    throw new Error('not implemented in test');
  },
  listSavedAlgorithms: async () => [],
  getSavedAlgorithm: async (_: string): Promise<GeoArtGraph> => {
    throw new Error('not implemented in test');
  },
};

test('renders without crashing', () => {
  const { container } = render(
    <AlgorithmStorageProvider service={stubStorageService}>
      <App />
    </AlgorithmStorageProvider>,
  );
  expect(container).toBeTruthy();
});
