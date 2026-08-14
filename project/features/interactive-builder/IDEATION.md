# Algorithm Builder — Ideation

## Note

A complete application rewrite is in play. This ideation is not constrained by the current architecture, but builds on the same primitives (nodes, module nodes, etc.).

## Side Panel Structural & Modulation Controls (Primary Focus)

### 1. Parameter Modulation & The Wave Registry

Instead of individual, isolated LFO nodes for each parameter, we introduce a **Wave Registry** concept to manage modulators centrally and apply them cleanly to parameter values.

#### Wave Registry Area
- Positioned at the top of the side panel in its own distinct area.
- Manages `wave-module-v2` nodes — built on existing primitives.
- Allows creating, naming, deleting, and modifying these master waves.
- Placement of wave registry controls in the panel is an open question (parked).

#### wave-module-v2
- `amplitude` is removed — swing range is set per binding, not on the wave itself.
- `frequency` is replaced by **cycle length** (number of ticks) — ties the wave to the engine's tempo.
- Output: normalised signal in the range −1 to 1.

##### Panel structure
- **Base layer:** waveform type, cycle length, phase — the fundamental oscillator.
- **Synthesis layers** (stackable via `+` button, removable):
  - **Additive partial** — harmonic ratio (e.g. 2×, 3×) + weight. Added to the base signal.
  - **FM modulator** — ratio to carrier + modulation depth + modulator waveform (selectable, not fixed to sine).

##### Wave shape preview
- Both the wave registry panel and the wave binding picker show a small waveform preview.
- The preview uses a **fixed time window**: short cycle length = many cycles visible (dense); long cycle length = slow curve or partial cycle (sparse). Encodes both shape and speed at a glance.
- A numeric label (e.g. `32 ticks`) sits alongside for precision.
- The same preview appears in the binding picker so the user can select by feel, not just by name.

#### Parameter Binding & Swing Controls
- Any continuous parameter (e.g., radius, speed, numPoints, eccentricity) has a wave-binding button.
- Selecting a wave from the Wave Registry binds that modulator to the parameter.
- Binding inserts an intermediate **swing node** (a new compute node) that takes the wave's −1→1 signal and scales it to the target parameter range.
  - Scaling formula: `min + (signal + 1) / 2 * (max - min)`
  - `min` and `max` are static values on the swing node — not themselves modulatable.
- A single wave can be bound to multiple parameters simultaneously; each binding has its own independent swing node with its own min/max.
- On unbind: the parameter's static value is set to the midpoint `(min + max) / 2`.
- **Min/Max Swing Controls:**
  - Direct `min` and `max` inputs.
  - A convenience slider that expands/contracts the range around the midpoint simultaneously.

### 2. Point Modifier Shortcuts (Color & Position)

For modules that output a `colorPointArrayValue`, a `+` button appears in their side panel section for both position and colour modifiers.

- Eligibility is inferred from the module's output type — any module with a `colorPointArrayValue` output port gets the shortcuts automatically. (To revisit.)
- Modifiers are inserted as real compute nodes downstream in the graph (not hidden inside the module).
- Multiple modifiers of each type can be stacked and apply sequentially, forming a chain.
- The controls for each inserted modifier node are shown inline within the module's panel section.

#### Position Modifiers
- Current type: **curve modulator** — displaces points along their normals using a wave signal.
- Exposed controls: wave shape (from registry), min/max swing, modulation angle, fixed offset.

#### Colour Modifiers
- New compute nodes — not yet implemented.
- Types:
  - **Straight clobber** — sets all points to a single static colour. Useful for debugging.
  - **Clobber by wave** — replaces point colours driven by a wave, sampled per-point along the array.
  - **Blend by wave** — blends existing point colours with a new colour, driven by a wave, sampled per-point.
- Wave sampling is per-point (along array length), with a temporal impact knob to mix time into the `t` value.

#### Architectural Note
The orbit module has an existing `colorSampler` input that handles colouring internally. This is an incongruency with the downstream-transform pattern the colour shortcuts use. The two approaches are separate paths to the same end.

## Deferred Surfaces

### 3. Canvas Overlay Controls (Out of Scope / Deferred)
- Drag handles and spatial canvas overlay gizmos are deferred.

### 4. Interactive Graph View (Deferred)
- Making the existing read-only graph view interactive is lower priority.

## Storage
Local storage, following the existing import-algorithm pattern.

## Bootstrapping
A "New Algorithm" button seeds a minimal graph containing only a `Time` node. The user builds from there.

## Open Questions
- **Wave Registry panel placement:** How does the side panel know to render `wave-module-v2` controls in the registry section vs. inline? (Parked — two candidates: route by kind in the panel, or add placement metadata to the module.)
- **Point modifier eligibility:** Confirm that eligibility for `+` shortcuts should be inferred from output type (`colorPointArrayValue`) rather than declared on the module.
- **Double Sliders vs. Center-Width Sliders:** Is a double-ended range slider more intuitive than separate min/max fields paired with a width slider?
