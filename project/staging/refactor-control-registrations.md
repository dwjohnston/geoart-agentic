# Refactor Control Registrations

## Problem

`graphEngine.ts` contains a growing `if (node.type === 'slider') ...` dispatch table that must be updated every time a new control type is added. It exports `SliderRegistration`, `ColorPickerRegistration`, `DropdownRegistration` types that bleed schema knowledge upward. `Controls.tsx` mirrors the same dispatch pattern. UI components (`SliderControl.tsx`, etc.) import from schema-types directly.

Adding the LFO control (T6 of lfo-control plan) would require touching all three locations. This refactor removes that requirement.

## Goal

Each control type owns its full stack — node def, dumb UI component, and the mapping between them — in one place. Adding a new control type requires no changes to `graphEngine.ts` or `Controls.tsx`.

## Folder Structure

Move node def files from `src/nodes/control/` into `src/nodes/control/nodes/`:

```
src/nodes/control/
  ui/                        ← dumb UI components (strip schema imports)
    SliderControl.tsx
    ColorPickerControl.tsx
    DropdownControl.tsx
  nodes/                     ← node defs (new subfolder, mirrors compute pattern)
    SliderNode.ts
    ColorPickerNode.ts
    DropdownNode.ts
  types.ts
  registry.ts
```

## Changes

### 1. `types.ts` — extend `ControlNodeDef`

Add `renderControl` to `ControlNodeDef`:

```typescript
import type { Value } from '../../graph/types';
import type React from 'react';
import type { ControlNode } from '../../schema/_generated/schema-types';

type ControlSetter = (paramKey: string, value: Value) => void;

export type ControlNodeDef = {
  type: string;
  outputs: PortDef[];
  params: Record<string, { type: string }>;
  evaluate(params: ResolvedParams): Value[];
  renderControl(node: ControlNode, set: ControlSetter): React.ReactNode;
};
```

### 2. UI components — strip schema knowledge

Each UI component receives only primitives. No imports from schema-types. Props are coincidentally similar to schema param shapes but are not derived from them.

**SliderControl.tsx** props become:
```typescript
type Props = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  initialValue: number;
  onChange: (value: number) => void;
};
```

**ColorPickerControl.tsx** props become:
```typescript
type ColorValue = { r: number; g: number; b: number; a: number };

type Props = {
  id: string;
  label: string;
  initialValue: ColorValue;
  onChange: (value: ColorValue) => void;
};
```

**DropdownControl.tsx** props become:
```typescript
type Props = {
  id: string;
  label: string;
  options: string[];
  initialValue: string;
  onChange: (value: string) => void;
};
```

Note: `nodeId` is removed from `onChange` signatures — callers no longer need it.

### 3. Node defs — add `renderControl`

Each node def in `nodes/` adds a `renderControl` method that maps schema params to UI props and wires `onChange` to the setter.

Example for `SliderNode.ts`:
```typescript
renderControl(node, set) {
  const n = node as Extract<ControlNode, { type: 'slider' }>;
  return (
    <SliderControl
      id={n.id}
      label={n.params.label?.v ?? ''}
      min={n.params.min?.v ?? 0}
      max={n.params.max?.v ?? 1}
      step={n.params.step?.v ?? 0.01}
      initialValue={n.params.value?.v ?? 0}
      onChange={v => set('value', { kind: 'number', v })}
    />
  );
}
```

### 4. `graphEngine.ts`

- Remove `SliderRegistration`, `ColorPickerRegistration`, `DropdownRegistration`, `ControlRegistration` types
- Remove `ColorValue` export (now owned by `ColorPickerControl.tsx`)
- Generalise `mutateControl` to accept a `paramKey` argument instead of hardcoding `'value'`:
  ```typescript
  function mutateControl(nodeId: string, paramKey: string, value: Value): void {
    ...
    compiledNode.params[paramKey] = value;
    ...
  }
  ```
- Change `load` return type to `GraphLoadPayload`:
  ```typescript
  export type GraphLoadPayload = {
    renderControlNodes: () => React.ReactNode;
  };
  ```
- Implement `renderControlNodes` by iterating `graph.control.nodes`, looking up each node's def in the registry, and calling `def.renderControl(node, (paramKey, value) => mutateControl(node.id, paramKey, value))`.
- Update `GraphEngine` type accordingly.

### 5. `Controls.tsx` — thin wrapper

Replace dispatch table with a call to `renderControlNodes()`. Receives `GraphLoadPayload` (or just the `renderControlNodes` function) instead of `ControlRegistration[]`.

```typescript
type Props = {
  renderControlNodes: () => React.ReactNode;
};

export function Controls({ renderControlNodes }: Props) {
  return <>{renderControlNodes()}</>;
}
```

### 6. Call site

Wherever `load()` is called, update to destructure `GraphLoadPayload` and pass `renderControlNodes` to `Controls`.

## Impact on lfo-control plan

T6 (LfoRegistration plumbing) becomes significantly simpler — just implement `renderControl` on `LfoControlNode`. No changes needed to `graphEngine.ts` dispatch or `Controls.tsx`.

## Out of scope

- No new control types in this refactor.
- `lfo-control` staging/execution files are not modified — this refactor is a prerequisite, not a replacement.
