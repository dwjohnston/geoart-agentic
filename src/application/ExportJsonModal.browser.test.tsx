import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { ExportJsonModal } from './ExportJsonModal';
import minimalGraph from '../algorithms/reference/minimal/minimalThreeNodeReferenceGraph';
import { graphToBuilderCode } from '../schema/builderCodegen';

test('JSON tab shown by default, TypeScript tab shows generated builder code, copy button copies active tab', async () => {
  const mockOnClose = vi.fn();
  const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

  await render(<ExportJsonModal graph={minimalGraph} onClose={mockOnClose} />);

  const textarea = page.getByRole('textbox');
  await expect.element(textarea).toBeInTheDocument();
  await expect.element(textarea).toHaveValue(JSON.stringify(minimalGraph, null, 2));

  const copyButton = page.getByRole('button', { name: 'Copy to clipboard' });
  await copyButton.click();
  expect(writeText).toHaveBeenCalledWith(JSON.stringify(minimalGraph, null, 2));

  const typeScriptTab = page.getByRole('button', { name: 'TypeScript' });
  await typeScriptTab.click();

  const expectedCode = graphToBuilderCode(minimalGraph);
  await expect.element(textarea).toHaveValue(expectedCode);

  await copyButton.click();
  expect(writeText).toHaveBeenCalledWith(expectedCode);

  const jsonTab = page.getByRole('button', { name: 'JSON' });
  await jsonTab.click();
  await expect.element(textarea).toHaveValue(JSON.stringify(minimalGraph, null, 2));
});
