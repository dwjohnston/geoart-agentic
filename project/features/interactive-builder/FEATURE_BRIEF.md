# Feature Brief: Interactive Algorithm Builder

## Overview
The Interactive Algorithm Builder enables users to visually and structurally design generative animations from the side panel. It replaces manual graph wiring with two high-level visual metaphors:
1. **The Wave Registry**: A central hub for managing global wave modulators (LFOs) that can be easily bound to any continuous parameter.
2. **Point Generator Shortcuts**: Direct controls inside generator modules (like Orbits or Points on a Line) to adjust downstream color and spatial positioning without manually creating or wiring compute nodes.

---

## Core Requirements

### 1. Wave Registry (Top of Side Panel)
- **Central Hub**: A dedicated visual area at the top of the side panel containing all global modulator wave modules.
- **Modulator Settings**: Users can create, name, and delete waves, and adjust their type (sine, triangle, saw, square) and base frequency.
- **State Management**: Modulator waves correspond to LFO/wave nodes in the underlying GeoArtGraph.

### 2. Parameter Modulation UI
- **Binding Dropdown**: Every continuous-value input (e.g., radius, speed, eccentricty, point count) features an expand/bind button to attach an existing wave from the Wave Registry.
- **Swing Bounds (Min/Max)**:
  - Users specify a `min` and `max` value that the parameter oscillates between.
  - Behind the scenes, the graph maps the wave's normalized output to this range.
- **Influence & Range Interaction**:
  - **Convenience Range Slider**: A slider that expands/contracts the `min` and `max` bounds simultaneously around their midpoint.
  - **Amplitude Scale**: A convenient multiplier slider (0% to 100% or 0x to 2x) to scale the depth of modulation.

### 3. Generator Shortcuts (Color & Transform)
For generator nodes that produce lists of points (such as Orbit or Points on a Line):
- **Point Color Section**:
  - A bottom-anchored control section within the generator's UI.
  - Modifying color values (solid, shifting, hue, etc.) auto-inserts and configures a color compute node directly downstream of the generator in the graph.
- **Point Position Section**:
  - Direct controls for translation, rotation, scale, or reflection.
  - Adjusting these auto-inserts and configures spatial/geometric compute nodes downstream in the graph.
- **Automated Routing**: Modifiers are cleanly sequenced between the point generator node and its destination render/combiner node.

---

## Scope & Boundaries

### In Scope
- Side panel UI components for Wave Registry, Binding Dropdowns, Min/Max Swing inputs, and Point Shortcuts.
- Automating graph mutation (adding, removing, and re-routing nodes) based on side-panel interactions.
- Preserving builder-state in local storage for the current algorithm.

### Out of Scope (Deferred / Non-Goals)
- **Canvas Overlays**: No visual gizmos, click-targets, or handles rendered on top of the animation canvas.
- **Interactive Graph View**: The existing graph representation remains read-only; no manual drag-and-drop wiring.

---

## Open Questions & Future Considerations
- **Multiple Modulators**: Can a single parameter be bound to multiple waves, or is it strictly 1-to-1? (MVP is 1-to-1).
- **Auto-wiring Mechanics**: How does the engine detect where to inject the shorthand color/position nodes in complex graphs with multiple render layers? (Targeting the immediate downstream render or parent node of the selected generator is the standard).
- **Default Seed Graph**: A "New Algorithm" button will generate a basic functional template (e.g., a simple coordinate generator and single render node) so the user has a baseline to build upon.
