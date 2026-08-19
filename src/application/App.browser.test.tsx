import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
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

  const canvas = page.getByTestId('live-canvas');
  expect(canvas).toBeInTheDocument();
});

test('renders the page title', async () => {
  // Explicit desktop viewport: the page title heading is part of the
  // desktop layout only (mobile is a render-only view, see useIsMobile).
  await page.viewport(1280, 800);

  await render(
    <AlgorithmStorageProvider service={stubStorageService}>
      <App />
    </AlgorithmStorageProvider>,
  );

  const heading = page.getByRole('heading', { level: 1, name: 'Geoart 3000' });
  expect(heading).toBeInTheDocument();
});

test('desktop viewport renders controls and side panels alongside the canvas', async () => {
  await page.viewport(1280, 800);

  await render(
    <AlgorithmStorageProvider service={stubStorageService}>
      <App />
    </AlgorithmStorageProvider>,
  );

  await expect.element(page.getByTestId('desktop-view')).toBeInTheDocument();
  await expect.element(page.getByTestId('live-canvas')).toBeInTheDocument();
  await expect.element(page.getByTestId('controls-container')).toBeInTheDocument();
  expect(page.getByTestId('mobile-view').elements()).toHaveLength(0);
});

test('mobile viewport renders only the canvas, no controls or side panels', async () => {
  await page.viewport(390, 844);

  await render(
    <AlgorithmStorageProvider service={stubStorageService}>
      <App />
    </AlgorithmStorageProvider>,
  );

  await expect.element(page.getByTestId('mobile-view')).toBeInTheDocument();
  await expect.element(page.getByTestId('live-canvas')).toBeInTheDocument();
  expect(page.getByTestId('desktop-view').elements()).toHaveLength(0);
  expect(page.getByTestId('controls-container').elements()).toHaveLength(0);

  // Restore viewport for subsequent tests in this file.
  await page.viewport(1280, 800);
});
