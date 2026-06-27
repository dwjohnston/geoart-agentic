# Task: ModifierStack component

Create `src/common-ui/ModifierStack.tsx` and `src/common-ui/ModifierStack.browser.test.tsx`.

## What it does

A generic stackable list with a type-picker. Used at the bottom of point-generator module panels to add position or colour modifiers. Each modifier is shown inline; multiple can be stacked in sequence.

## Props

```ts
type AvailableType = { type: string; label: string };

type Props<T> = {
  items: T[];
  availableTypes: AvailableType[];
  onAdd: (type: string) => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
};
```

## Behaviour

- Renders a list of items, each wrapped in a container with a "×" remove button (`data-testid="modifier-remove-{index}"`).
- Below the list, a `+` button (`data-testid="modifier-add-btn"`) opens a small inline picker (a list of buttons or a `<select>`) showing `availableTypes`.
- Selecting a type calls `onAdd(type)` and closes the picker.
- The picker closes if the user clicks `+` again or selects a type.
- If `availableTypes` is empty, the `+` button is hidden.

## Tests

Use `vitest-browser-react`. Import `page` from `@vitest/browser/page`. Use `userEvent` from `@vitest/browser/page` for interactions.

Test cases:
1. Renders items via renderItem.
2. Each item has a remove button; clicking it calls onRemove with correct index.
3. `+` button is visible when availableTypes is non-empty.
4. `+` button is hidden when availableTypes is empty.
5. Clicking `+` shows the type picker.
6. Selecting a type from the picker calls onAdd with the correct type string.

## Reference patterns

See `src/nodes/control/ui/SliderControl.browser.test.tsx` for the test pattern.
See `src/nodes/control/ui/ColorPickerControl.tsx` for a simple component pattern.

Run `bun test ModifierStack` to verify. Run `bun typecheck` to check types.
