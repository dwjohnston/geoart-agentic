import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { ImportAlgorithmModal } from './ImportAlgorithmModal';
import { AlgorithmStorageProvider } from './algorithmStorage/AlgorithmStorageProvider';
import type { IAlgorithmStorageService, StoredAlgorithmEntry } from './algorithmStorage/IAlgorithmStorageService';
import type { GeoArtGraph } from '../schema/_generated/schema-types';
import minimalGraph from '../algorithms/reference/minimal/minimalThreeNodeReferenceGraph';
import { page } from 'vitest/browser'

async function waitForElement(selector: string, timeout = 3000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element) return element;
    await new Promise(r => setTimeout(r, 50));
  }
  throw new Error(`Timeout waiting for element: ${selector}`);
}

function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  textarea.value = value;
  const inputEvent = new Event('input', { bubbles: true });
  Object.defineProperty(inputEvent, 'target', { value: textarea, enumerable: true });
  textarea.dispatchEvent(inputEvent);

  const changeEvent = new Event('change', { bubbles: true });
  Object.defineProperty(changeEvent, 'target', { value: textarea, enumerable: true });
  textarea.dispatchEvent(changeEvent);
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

  await (expect.element(page.getByRole("textbox")).toBeInTheDocument())
  const textarea = page.getByRole("textbox");

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

  await (expect.element(page.getByRole("textbox")).toBeInTheDocument())
  const textarea = page.getByRole("textbox");

  await textarea.fill("invalid json");

  const importButton = page.getByRole("button", { name: "Import" });
  await importButton.click();

  const error = page.getByRole("alert");
  expect(error).toBeInTheDocument();
  expect(error).toHaveTextContent(/JSON parse error/i);
  expect(mockSaveAlgorithm).not.toHaveBeenCalled();
  expect(mockOnImported).not.toHaveBeenCalled();
  expect(mockOnClose).not.toHaveBeenCalled();

});

test.skip('Unhappy path: valid JSON that does not match schema displays error message', async () => {
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

  const textarea = (await waitForElement('textarea')) as HTMLTextAreaElement;
  setTextareaValue(textarea, JSON.stringify(notAGraph));

  const buttons = Array.from(document.body.querySelectorAll('button'));
  const importButton = buttons.find(b => b.textContent?.includes('Import')) as HTMLButtonElement;
  importButton.click();

  const alert = await waitForElement('[role="alert"]') as HTMLElement;
  expect(alert.textContent).toContain('does not match schema');
  expect(mockOnImported).not.toHaveBeenCalled();
  expect(mockOnClose).not.toHaveBeenCalled();
});

test.skip('Unhappy path: valid JSON that passes schema but fails compilation', async () => {
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

  const textarea = (await waitForElement('textarea')) as HTMLTextAreaElement;
  setTextareaValue(textarea, JSON.stringify(invalidGraph));

  const buttons = Array.from(document.body.querySelectorAll('button'));
  const importButton = buttons.find(b => b.textContent?.includes('Import')) as HTMLButtonElement;
  importButton.click();

  const alert = await waitForElement('[role="alert"]') as HTMLElement;
  expect(alert.textContent).toContain('unknown source node');
  expect(mockOnImported).not.toHaveBeenCalled();
  expect(mockOnClose).not.toHaveBeenCalled();
});
