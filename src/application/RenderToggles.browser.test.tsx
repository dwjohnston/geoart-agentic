import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { RenderToggles } from './RenderToggles';
import type { GraphLoadPayload } from '../graphEngine/exports';

type RenderingNode = GraphLoadPayload['renderingNodes'][number];

const nodes: RenderingNode[] = [
  { nodeId: 'trail', renderConfig: { layer: 'paint' } },
  { nodeId: 'dot', renderConfig: { layer: 'live', displayByDefault: false } },
  { nodeId: 'foo', renderConfig: { layer: 'paint' } },
  { nodeId: 'bar', renderConfig: { layer: 'live', displayByDefault: false } },
];

test('enable all and disable all', async () => {
  const onToggle = vi.fn();

  await render(<RenderToggles renderingNodes={nodes} onToggle={onToggle} />);




  const trail = page.getByRole('checkbox', { name: /trail/ });
  const dot = page.getByRole('checkbox', { name: /dot/ });
  const foo = page.getByRole('checkbox', { name: /foo/ });
  const bar = page.getByRole('checkbox', { name: /bar/ });

  expect(page.getByRole('checkbox').elements()).toHaveLength(4);

  // initial state: trail/foo on, dot/bar off
  await expect.element(trail).toBeChecked();
  await expect.element(foo).toBeChecked();
  await expect.element(dot).not.toBeChecked();
  await expect.element(bar).not.toBeChecked();

  // enable all brings all four on, toggling only the two that were off
  await page.getByRole('button', { name: /Enable All/ }).click();
  await expect.element(trail).toBeChecked();
  await expect.element(dot).toBeChecked();
  await expect.element(foo).toBeChecked();
  await expect.element(bar).toBeChecked();
  expect(onToggle).toHaveBeenCalledWith('dot');
  expect(onToggle).toHaveBeenCalledWith('bar');
  expect(onToggle).toHaveBeenCalledTimes(2);

  onToggle.mockClear();

  // disable all brings all four off
  await page.getByRole('button', { name: /Disable All/ }).click();
  await expect.element(trail).not.toBeChecked();
  await expect.element(dot).not.toBeChecked();
  await expect.element(foo).not.toBeChecked();
  await expect.element(bar).not.toBeChecked();
  expect(onToggle).toHaveBeenCalledTimes(4);
});

test('toggle by layer — enable live, then disable live', async () => {
  const onToggle = vi.fn();

  await render(<RenderToggles renderingNodes={nodes} onToggle={onToggle} />);

  const dot = page.getByRole('checkbox', { name: /dot/ });
  const bar = page.getByRole('checkbox', { name: /bar/ });

  // dot and bar start off
  await expect.element(dot).not.toBeChecked();
  await expect.element(bar).not.toBeChecked();

  // enable live — only the two off nodes are toggled
  await page.getByRole('button', { name: /Enable live/ }).click();
  await expect.element(dot).toBeChecked();
  await expect.element(bar).toBeChecked();
  expect(onToggle).toHaveBeenCalledWith('dot');
  expect(onToggle).toHaveBeenCalledWith('bar');
  expect(onToggle).toHaveBeenCalledTimes(2);

  onToggle.mockClear();

  // disable live — both live nodes are now on, so both are toggled off
  await page.getByRole('button', { name: /Disable live/ }).click();
  await expect.element(dot).not.toBeChecked();
  await expect.element(bar).not.toBeChecked();
  expect(onToggle).toHaveBeenCalledWith('dot');
  expect(onToggle).toHaveBeenCalledWith('bar');
  expect(onToggle).toHaveBeenCalledTimes(2);
});

test('toggle by layer — disable paint does not affect live nodes', async () => {
  const onToggle = vi.fn();

  await render(<RenderToggles renderingNodes={nodes} onToggle={onToggle} />);

  const trail = page.getByRole('checkbox', { name: /trail/ });
  const dot = page.getByRole('checkbox', { name: /dot/ });
  const foo = page.getByRole('checkbox', { name: /foo/ });
  const bar = page.getByRole('checkbox', { name: /bar/ });

  await page.getByRole('button', { name: /Disable paint/ }).click();

  await expect.element(trail).not.toBeChecked();
  await expect.element(foo).not.toBeChecked();
  // live nodes untouched
  await expect.element(dot).not.toBeChecked();
  await expect.element(bar).not.toBeChecked();
  expect(onToggle).toHaveBeenCalledWith('trail');
  expect(onToggle).toHaveBeenCalledWith('foo');
  expect(onToggle).toHaveBeenCalledTimes(2);
});
