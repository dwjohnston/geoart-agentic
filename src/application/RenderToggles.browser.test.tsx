import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { RenderToggles } from './RenderToggles';
import type { GraphLoadPayload } from '../graphEngine/exports';

type RenderingNode = GraphLoadPayload['renderingNodes'][number];

const nodes: RenderingNode[] = [
  { nodeId: 'trail', renderConfig: { layer: 'paint', tags: ['orbit', 'trail'] } },
  { nodeId: 'dot',   renderConfig: { layer: 'live',  displayByDefault: false, tags: ['orbit', 'points'] } },
  { nodeId: 'foo',   renderConfig: { layer: 'paint', tags: ['trail'] } },
  { nodeId: 'bar',   renderConfig: { layer: 'live',  displayByDefault: false, tags: ['points'] } },
];
// initial enabled: trail, foo
// tags:   orbit  → trail(on), dot(off)
//         trail  → trail(on), foo(on)
//         points → dot(off),  bar(off)

test('RenderToggles — full interaction', async () => {
  const onToggle = vi.fn();

  await render(<RenderToggles renderingNodes={nodes} onToggle={onToggle} />);

  const trail = page.getByRole('checkbox', { name: /trail/ });
  const dot   = page.getByRole('checkbox', { name: /dot/ });
  const foo   = page.getByRole('checkbox', { name: /foo/ });
  const bar   = page.getByRole('checkbox', { name: /bar/ });

  // 1. four checkboxes
  expect(page.getByRole('checkbox').elements()).toHaveLength(4);

  // 2. initial checked state
  await expect.element(trail).toBeChecked();
  await expect.element(foo).toBeChecked();
  await expect.element(dot).not.toBeChecked();
  await expect.element(bar).not.toBeChecked();

  // 3. layer button labels — paint has nodes on so shows Disable; live has none on so shows Enable
  expect(page.getByRole('button', { name: 'Disable paint' })).toBeInTheDocument();
  expect(page.getByRole('button', { name: 'Enable live' })).toBeInTheDocument();

  // 4. tag button labels
  expect(page.getByRole('button', { name: 'Disable orbit' })).toBeInTheDocument();  // trail is on
  expect(page.getByRole('button', { name: 'Disable trail' })).toBeInTheDocument();  // trail+foo both on
  expect(page.getByRole('button', { name: 'Enable points' })).toBeInTheDocument();  // dot+bar both off

  // 5. enable/disable all button — not all enabled so shows Enable All
  expect(page.getByRole('button', { name: 'Enable All' })).toBeInTheDocument();

  // 6. individual toggle — click dot
  await dot.click();
  await expect.element(dot).toBeChecked();
  expect(onToggle).toHaveBeenCalledWith('dot');
  onToggle.mockClear();
  // state: trail(on), dot(on), foo(on), bar(off)

  // 7. layer toggle
  // live now has dot on → shows Disable live
  await page.getByRole('button', { name: 'Disable live' }).click();
  await expect.element(dot).not.toBeChecked();
  await expect.element(bar).not.toBeChecked();
  onToggle.mockClear();
  // state: trail(on), dot(off), foo(on), bar(off)

  await page.getByRole('button', { name: 'Enable live' }).click();
  await expect.element(dot).toBeChecked();
  await expect.element(bar).toBeChecked();
  onToggle.mockClear();
  // state: trail(on), dot(on), foo(on), bar(on)

  // 8. toggle all
  await page.getByRole('button', { name: 'Disable All' }).click();
  await expect.element(trail).not.toBeChecked();
  await expect.element(dot).not.toBeChecked();
  await expect.element(foo).not.toBeChecked();
  await expect.element(bar).not.toBeChecked();
  onToggle.mockClear();

  await page.getByRole('button', { name: 'Enable All' }).click();
  await expect.element(trail).toBeChecked();
  await expect.element(dot).toBeChecked();
  await expect.element(foo).toBeChecked();
  await expect.element(bar).toBeChecked();
  onToggle.mockClear();
  // state: all on

  // 9. tag toggle — orbit contains trail+dot, both currently on
  await page.getByRole('button', { name: 'Disable orbit' }).click();
  await expect.element(trail).not.toBeChecked();
  await expect.element(dot).not.toBeChecked();
  await expect.element(foo).toBeChecked();   // not in orbit
  await expect.element(bar).toBeChecked();   // not in orbit
  expect(onToggle).toHaveBeenCalledWith('trail');
  expect(onToggle).toHaveBeenCalledWith('dot');
  expect(onToggle).toHaveBeenCalledTimes(2);
});
