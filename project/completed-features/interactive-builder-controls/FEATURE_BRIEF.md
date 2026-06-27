# Feature Brief: Interactive Builder Controls

## Context

These controls support the Interactive Algorithm Builder. They live in `src/common-ui/` and are purely presentational React components — no graph engine knowledge.

See `project/features/interactive-builder/IDEATION.md` for full design context.

## Controls to Build

### 1. WaveformPreview

Small visual preview of a wave signal.

- Fixed time window: always shows the same duration (approximately 2 cycles of a 1-unit cycle-length wave). Short cycle length = many cycles visible (dense). Long cycle length = sparse.
- Renders normalised signal (-1 to 1) on a vertical axis.
- Props: a signal function `(t: number) => number` where `t` is in ticks, plus a `cycleLength` number so the component knows how many ticks to show.
- Compact — fits inline in a registry entry or binding picker row.
- Rendered as SVG.

### 2. SwingRangeControl

Min/max swing inputs with a convenience range slider.

- Two numeric inputs: `min` and `max`.
- A range/influence slider that moves `min` and `max` symmetrically around their midpoint (contracting or expanding the gap simultaneously).
- Props: `min`, `max`, `onChange({ min, max })`.
- No knowledge of wave binding.

### 3. ModifierStack

Generic stackable list with a type-picker.

- Displays an ordered list of modifier entries, each rendered via a render prop.
- A `+` button opens a type-picker (dropdown or popover) with selectable type strings.
- Each entry has a remove button.
- Props: `items`, `onAdd(type: string)`, `onRemove(index: number)`, `renderItem(item, index)`, `availableTypes: Array<{ type: string, label: string }>`.
- Order is display-only (no drag-to-reorder for now).

### 4. WaveBindingButton

Per-parameter wave binding toggle.

- **Unbound state:** small button with a label ("Bind wave").
- **Bound state:** shows the bound wave name + an inline WaveformPreview.
- Clicking in either state opens a picker listing all available waves (name + WaveformPreview each).
- Selecting a wave calls `onBind(waveId)`. An "Unbind" option calls `onUnbind()`.
- Props: `boundWaveId: string | null`, `availableWaves: Array<{ id: string, name: string, signalFn: (t: number) => number, cycleLength: number }>`, `onBind`, `onUnbind`.

## File Locations

All components go in `src/common-ui/`. Each gets:
- `ComponentName.tsx`
- `ComponentName.browser.test.tsx`

## Constraints

- No graph engine imports. Pure UI only.
- Follow existing component patterns: `data-testid` attributes, browser tests using `vitest-browser-react` and `@vitest/browser/page`.
- Use inline styles consistent with existing components (see `src/nodes/control/ui/` for examples).
- Use `bun test <filename>` to run tests. Use `bun typecheck` to check types.
