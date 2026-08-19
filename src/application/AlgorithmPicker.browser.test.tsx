import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { AlgorithmPicker } from './AlgorithmPicker';
import type { AlgorithmEntry } from './AlgorithmPicker';
import type { GeoArtGraph } from '../schema/_generated/schema-types';

function makeGraph(overrides: Partial<GeoArtGraph> = {}): GeoArtGraph {
  return {
    version: '2.0',
    control: { nodes: [] },
    compute: { nodes: [] },
    render: { nodes: [] },
    ...overrides,
  };
}

const withDescription: AlgorithmEntry = {
  id: 'with-description',
  name: 'With Description',
  folder: 'demo',
  source: 'bundled',
  graph: makeGraph({ title: 'With Description', description: 'An enticing description of the graph.' }),
};

const withoutDescription: AlgorithmEntry = {
  id: 'without-description',
  name: 'Without Description',
  folder: 'demo',
  source: 'bundled',
  graph: makeGraph({ title: 'Without Description' }),
};

test('AlgorithmPicker — shows description when present', async () => {
  await render(
    <AlgorithmPicker
      algorithms={[withDescription, withoutDescription]}
      defaultId={withDescription.id}
      onChange={vi.fn()}
      onImportClick={vi.fn()}
    />,
  );

  await expect.element(page.getByText('An enticing description of the graph.')).toBeInTheDocument();
});

test('AlgorithmPicker — renders nothing extra when description absent', async () => {
  await render(
    <AlgorithmPicker
      algorithms={[withDescription, withoutDescription]}
      defaultId={withoutDescription.id}
      onChange={vi.fn()}
      onImportClick={vi.fn()}
    />,
  );

  await expect.element(page.getByRole('heading', { name: 'Without Description' })).toBeInTheDocument();
  expect(page.getByText('An enticing description of the graph.').elements()).toHaveLength(0);
});

test('AlgorithmPicker — description updates when selection changes', async () => {
  const onChange = vi.fn();
  await render(
    <AlgorithmPicker
      algorithms={[withDescription, withoutDescription]}
      defaultId={withDescription.id}
      onChange={onChange}
      onImportClick={vi.fn()}
    />,
  );

  await expect.element(page.getByText('An enticing description of the graph.')).toBeInTheDocument();

  const select = page.getByRole('combobox');
  await select.selectOptions('without-description');

  expect(onChange).toHaveBeenCalledWith('without-description');
  expect(page.getByText('An enticing description of the graph.').elements()).toHaveLength(0);
});
