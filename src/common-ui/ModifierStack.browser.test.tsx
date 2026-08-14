import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { ModifierStack } from './ModifierStack';

type TestItem = { label: string };

const availableTypes = [
  { type: 'position', label: 'Position' },
  { type: 'color', label: 'Color' },
];

describe('ModifierStack', () => {
  test('renders items via renderItem', async () => {
    const items: TestItem[] = [{ label: 'Item A' }, { label: 'Item B' }];
    await render(
      <ModifierStack
        items={items}
        availableTypes={availableTypes}
        onAdd={() => {}}
        onRemove={() => {}}
        renderItem={(item) => <span>{item.label}</span>}
      />
    );
    expect(page.getByText('Item A')).toBeInTheDocument();
    expect(page.getByText('Item B')).toBeInTheDocument();
  });

  test('each item has a remove button that calls onRemove with the correct index', async () => {
    const onRemove = vi.fn();
    const items: TestItem[] = [{ label: 'Alpha' }, { label: 'Beta' }, { label: 'Gamma' }];
    await render(
      <ModifierStack
        items={items}
        availableTypes={availableTypes}
        onAdd={() => {}}
        onRemove={onRemove}
        renderItem={(item) => <span>{item.label}</span>}
      />
    );
    await page.getByTestId('modifier-remove-1').click();
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  test('+ button is visible when availableTypes is non-empty', async () => {
    await render(
      <ModifierStack
        items={[]}
        availableTypes={availableTypes}
        onAdd={() => {}}
        onRemove={() => {}}
        renderItem={() => null}
      />
    );
    expect(page.getByTestId('modifier-add-btn')).toBeInTheDocument();
  });

  test('+ button is not rendered when availableTypes is empty', async () => {
    await render(
      <ModifierStack
        items={[]}
        availableTypes={[]}
        onAdd={() => {}}
        onRemove={() => {}}
        renderItem={() => null}
      />
    );
    expect(page.getByTestId('modifier-add-btn').query()).toBeNull();
  });

  test('clicking + shows the type picker', async () => {
    await render(
      <ModifierStack
        items={[]}
        availableTypes={availableTypes}
        onAdd={() => {}}
        onRemove={() => {}}
        renderItem={() => null}
      />
    );
    expect(page.getByTestId('modifier-type-picker').query()).toBeNull();
    await page.getByTestId('modifier-add-btn').click();
    expect(page.getByTestId('modifier-type-picker')).toBeInTheDocument();
  });

  test('selecting a type calls onAdd with the correct type string and closes the picker', async () => {
    const onAdd = vi.fn();
    await render(
      <ModifierStack
        items={[]}
        availableTypes={availableTypes}
        onAdd={onAdd}
        onRemove={() => {}}
        renderItem={() => null}
      />
    );
    await page.getByTestId('modifier-add-btn').click();
    await page.getByTestId('modifier-type-position').click();
    expect(onAdd).toHaveBeenCalledWith('position');
    expect(page.getByTestId('modifier-type-picker').query()).toBeNull();
  });
});
