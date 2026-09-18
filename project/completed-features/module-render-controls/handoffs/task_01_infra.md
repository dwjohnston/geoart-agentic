# Handoff — task 1 (render toggle plumbing)

## New type: `ModuleRenderToggleInfo`

Defined in `src/graphEngine/externalInterfaces/ModuleImplementation.ts`:

```ts
export type ModuleRenderToggleInfo = {
  nodes: Array<{ nodeId: string; renderConfig: RenderLayerConfig; enabled: boolean }>;
  onToggle: (nodeId: string) => void;
};
```

`nodes` is scoped to just the render nodes owned by that module instance (namespaced `{moduleId}:...`), with `enabled` reflecting the engine's real, current toggle state (not a guess). Calling `onToggle(nodeId)` flips that node's visibility in the running engine immediately.

## New `renderControl` signature

`inputMarkerNode.renderControl` now takes a third argument:

```ts
renderControl: (params: StaticModuleNodeParams<K>, set: ModuleControlSetter<K>, renderToggles: ModuleRenderToggleInfo) => React.ReactNode
```

Existing 2-arg implementations (`(params, set) => ...`) remain valid TypeScript — the extra argument is simply ignored until a module opts in.

## `ModuleRenderToggles` component

`src/ui/ModuleRenderToggles.tsx` — drop-in component, `<ModuleRenderToggles nodes={renderToggles.nodes} onToggle={renderToggles.onToggle} />` (or spread `{...renderToggles}`). Renders nothing when `nodes` is empty. Renders a "toggle all" button scoped to just those nodes plus one checkbox per node, labelled with the `{moduleId}:` prefix stripped.

Use inside a module's `<ModulePanel>`:

```tsx
renderControl: (params, set, renderToggles) => (
  <ModulePanel moduleName="Orbit" moduleId={moduleId}>
    {/* existing knobs */}
    <ModuleRenderToggles {...renderToggles} />
  </ModulePanel>
)
```

## Not touched

- `RenderToggles.tsx` and its "toggle all" / per-layer / per-tag / per-module behaviour — unchanged.
- No control nodes were added to `controlNodes` anywhere.
