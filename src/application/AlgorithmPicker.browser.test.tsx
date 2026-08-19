import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { AlgorithmPicker } from './AlgorithmPicker';
import type { AlgorithmEntry } from './AlgorithmPicker';
import minimalGraph from '../algorithms/reference/minimal/minimalThreeNodeReferenceGraph';

const algorithms: AlgorithmEntry[] = [
  { id: 'minimal-three-node', name: 'Minimal Three Node', graph: minimalGraph, source: 'bundled' },
];

test('Export button opens a modal with generated component source for the selected algorithm', async () => {
  await render(
    <AlgorithmPicker algorithms={algorithms} defaultId="minimal-three-node" onChange={() => {}} onImportClick={() => {}} />,
  );

  const exportButton = page.getByRole('button', { name: 'Export' });
  await exportButton.click();

  const source = page.getByTestId('export-source');
  await expect.element(source).toBeInTheDocument();
  const value = (source.element() as HTMLTextAreaElement).value;
  expect(value).toContain("import { AlgorithmCanvas } from './graphEngine/exports';");
  expect(value).toContain('export function MinimalThreeNode(');
});
