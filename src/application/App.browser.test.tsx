import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { App } from './App';
import { AlgorithmStorageProvider } from './algorithmStorage/AlgorithmStorageProvider';
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

test('renders without crashing', async () => {
  await render(
    <AlgorithmStorageProvider service={stubStorageService}>
      <App />
    </AlgorithmStorageProvider>,
  );

  const canvas = document.body.querySelector('canvas');
  expect(canvas).toBeTruthy();
});
