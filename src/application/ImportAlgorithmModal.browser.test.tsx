import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { ImportAlgorithmModal } from './ImportAlgorithmModal';
import { AlgorithmStorageProvider } from './algorithmStorage/AlgorithmStorageProvider';
import type { IAlgorithmStorageService, StoredAlgorithmEntry } from './algorithmStorage/IAlgorithmStorageService';
import type { GeoArtGraph } from '../schema/_generated/schema-types';
import minimalGraph from '../algorithms/reference/minimal/minimalThreeNodeReferenceGraph';
import { page } from 'vitest/browser'

/**
 * The modal opens on the TypeScript tab; switch to JSON and return its
 * textarea. Queried by accessible name because the docs panel's search box
 * is also a textbox.
 */
async function openJsonTab() {
  await page.getByRole('button', { name: 'JSON' }).click();
  const textarea = page.getByRole('textbox', { name: /paste a json algorithm definition/i });
  await expect.element(textarea).toBeInTheDocument();
  return textarea;
}


test('Happy path: imports valid graph and saves to storage', async () => {
  const mockSaveAlgorithm = vi.fn().mockResolvedValue({
    id: 'test-id-123',
    name: 'Minimal Three Node',
    graph: minimalGraph,
  } as StoredAlgorithmEntry);
  const mockOnImported = vi.fn();
  const mockOnClose = vi.fn();

  const storage: IAlgorithmStorageService = {
    saveAlgorithm: mockSaveAlgorithm,
    listSavedAlgorithms: async () => [],
    getSavedAlgorithm: async () => minimalGraph,
  };

  await render(
    <AlgorithmStorageProvider service={storage}>
      <ImportAlgorithmModal onClose={mockOnClose} onImported={mockOnImported} />
    </AlgorithmStorageProvider>,
  );

  const textarea = await openJsonTab();

  await textarea.fill(JSON.stringify(minimalGraph));

  const importButton = page.getByRole("button", { name: "Import" });
  await importButton.click();

  await vi.waitFor(() => {
    expect(mockSaveAlgorithm).toHaveBeenCalled();
    expect(mockOnImported).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

});

test('Unhappy path: invalid JSON displays error message', async () => {
  const mockSaveAlgorithm = vi.fn().mockResolvedValue({
    id: 'test-id-123',
    name: 'Minimal Three Node',
    graph: minimalGraph,
  } as StoredAlgorithmEntry);
  const mockOnImported = vi.fn();
  const mockOnClose = vi.fn();

  const storage: IAlgorithmStorageService = {
    saveAlgorithm: mockSaveAlgorithm,
    listSavedAlgorithms: async () => [],
    getSavedAlgorithm: async () => minimalGraph,
  };

  await render(
    <AlgorithmStorageProvider service={storage}>
      <ImportAlgorithmModal onClose={mockOnClose} onImported={mockOnImported} />
    </AlgorithmStorageProvider>,
  );

  const textarea = await openJsonTab();

  await textarea.fill("invalid json");

  const importButton = page.getByRole("button", { name: "Import" });
  await importButton.click();

  // Monaco (mounted by other tests in this file, once the TypeScript tab is
  // opened) leaves empty aria-alert live-region elements in the document
  // that persist across tests, so the query must be filtered by text rather
  // than matching any role="alert" element.
  const error = page.getByRole("alert").filter({ hasText: /JSON parse error/i });
  expect(error).toBeInTheDocument();
  expect(error).toHaveTextContent(/JSON parse error/i);
  expect(mockSaveAlgorithm).not.toHaveBeenCalled();
  expect(mockOnImported).not.toHaveBeenCalled();
  expect(mockOnClose).not.toHaveBeenCalled();

});

test('Unhappy path: valid JSON that does not match schema displays error message', async () => {
  const mockOnImported = vi.fn();
  const mockOnClose = vi.fn();

  const storage: IAlgorithmStorageService = {
    saveAlgorithm: async () => ({ id: '', name: '', graph: minimalGraph }),
    listSavedAlgorithms: async () => [],
    getSavedAlgorithm: async () => minimalGraph,
  };

  const notAGraph = {
    someKey: 'someValue',
    nested: { data: 123 },
  };

  await render(
    <AlgorithmStorageProvider service={storage}>
      <ImportAlgorithmModal onClose={mockOnClose} onImported={mockOnImported} />
    </AlgorithmStorageProvider>,
  );

  const textarea = await openJsonTab();

  await textarea.fill(JSON.stringify(notAGraph));

  const importButton = page.getByRole("button", { name: "Import" });
  await importButton.click();

  const alert = page.getByRole("alert").filter({ hasText: /does not match schema/i });
  expect(alert).toBeInTheDocument();
  expect(alert).toHaveTextContent(/does not match schema/i);
  expect(mockOnImported).not.toHaveBeenCalled();
  expect(mockOnClose).not.toHaveBeenCalled();
});

test('TypeScript tab (default): imports the starter script and saves to storage', async () => {
  const mockSaveAlgorithm = vi.fn().mockResolvedValue({
    id: 'test-id-123',
    name: 'Minimal Three Node',
    graph: minimalGraph,
  } as StoredAlgorithmEntry);
  const mockOnImported = vi.fn();
  const mockOnClose = vi.fn();

  const storage: IAlgorithmStorageService = {
    saveAlgorithm: mockSaveAlgorithm,
    listSavedAlgorithms: async () => [],
    getSavedAlgorithm: async () => minimalGraph,
  };

  await render(
    <AlgorithmStorageProvider service={storage}>
      <ImportAlgorithmModal onClose={mockOnClose} onImported={mockOnImported} />
    </AlgorithmStorageProvider>,
  );

  // No tab click — TypeScript is the default editor.
  const importButton = page.getByRole('button', { name: 'Import' });
  await importButton.click();

  // The TypeScript compiler is dynamically imported on submit (see
  // ImportAlgorithmModal's lazy `import('./compileTypeScriptToGraph')`), so
  // this can take noticeably longer than the default waitFor timeout,
  // especially on a cold Vite dev-transform/optimizeDeps cache.
  await vi.waitFor(
    () => {
      expect(mockSaveAlgorithm).toHaveBeenCalled();
    },
    { timeout: 10000 }
  );

  const savedGraph = mockSaveAlgorithm.mock.calls[0][0] as GeoArtGraph;
  expect(savedGraph.control.nodes).toHaveLength(1);
  expect(savedGraph.control.nodes[0].id).toBe('speed');
  expect(mockOnImported).toHaveBeenCalled();
  expect(mockOnClose).toHaveBeenCalled();
});

test('Unhappy path: valid JSON that passes schema but fails compilation', async () => {
  const mockOnImported = vi.fn();
  const mockOnClose = vi.fn();

  const storage: IAlgorithmStorageService = {
    saveAlgorithm: async () => ({ id: '', name: '', graph: minimalGraph }),
    listSavedAlgorithms: async () => [],
    getSavedAlgorithm: async () => minimalGraph,
  };

  const invalidGraph: GeoArtGraph = {
    version: '2.0',
    title: 'Invalid Graph',
    control: { nodes: [] },
    compute: { nodes: [] },
    render: {
      nodes: [
        {
          id: 'circle',
          type: 'circle',
          renderConfig: { layer: 'live' },
          params: {
            radius: { v: 0.25 },
            centerPoints: { ref: 'nonExistentNode.points' },
          },
        },
      ],
    },
  };

  await render(
    <AlgorithmStorageProvider service={storage}>
      <ImportAlgorithmModal onClose={mockOnClose} onImported={mockOnImported} />
    </AlgorithmStorageProvider>,
  );

  const textarea = await openJsonTab();

  await textarea.fill(JSON.stringify(invalidGraph));

  const importButton = page.getByRole("button", { name: "Import" });
  await importButton.click();

  const alert = page.getByRole("alert").filter({ hasText: /unknown source node/i });
  expect(alert).toBeInTheDocument();
  expect(alert).toHaveTextContent(/unknown source node/i);
  expect(mockOnImported).not.toHaveBeenCalled();
  expect(mockOnClose).not.toHaveBeenCalled();
});

test('Docs panel: schema-generated reference is shown, filterable, and follows the active tab syntax', async () => {
  const storage: IAlgorithmStorageService = {
    saveAlgorithm: async () => ({ id: '', name: '', graph: minimalGraph }),
    listSavedAlgorithms: async () => [],
    getSavedAlgorithm: async () => minimalGraph,
  };

  // The docs panel is desktop-only (see useIsMobile) — the default test
  // viewport is below the mobile breakpoint.
  await page.viewport(1280, 800);

  await render(
    <AlgorithmStorageProvider service={storage}>
      <ImportAlgorithmModal onClose={() => {}} onImported={() => {}} />
    </AlgorithmStorageProvider>,
  );

  const docs = page.getByRole('complementary', { name: 'Schema documentation' });
  await expect.element(docs).toBeInTheDocument();
  // Default (TypeScript) tab: examples are builder calls.
  await expect.element(docs).toHaveTextContent(/new AlgorithmBuilder/);

  const search = page.getByRole('searchbox', { name: 'Search documentation' });
  await search.fill('slider');
  await expect.element(docs).toHaveTextContent(/Slider Control Node/);
  await expect.element(docs).toHaveTextContent(/\.addControlNode\(/);
  await expect.element(docs).not.toHaveTextContent(/Circle Render Node/);

  // JSON tab: same entry, JSON syntax.
  await page.getByRole('button', { name: 'JSON' }).click();
  await expect.element(docs).toHaveTextContent(/"type": "slider"/);
  await expect.element(docs).not.toHaveTextContent(/\.addControlNode\(/);

  // Mobile: only the editor is shown.
  await page.viewport(390, 844);
  await expect.element(docs).not.toBeInTheDocument();
  await expect.element(page.getByRole('textbox', { name: /paste a json algorithm definition/i })).toBeInTheDocument();
});
