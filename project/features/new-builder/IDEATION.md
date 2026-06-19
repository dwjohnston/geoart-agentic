# Algorithm Builder — Ideation

## Three surfaces

### 1. Canvas overlay controls (builder mode)
- Spacebar toggles builder mode → resets to t=0, animation pauses, overlay gizmos appear
- Click a node on the canvas → context menu: add child node, remove, duplicate
- Drag handles to adjust spatial parameters (orbit radius, tilt, centre position)
- Node creation is contextual and spatial — wiring is implied, not explicit
- Primary (selected) node gets full handles; others ghost (visible, not interactive)

### 2. Parameter modulation expansion
- Any continuous-value parameter has an expand button
- Expand → inline controls: frequency, amplitude, wave type (creates + wires an LFO node)
- FM falls out naturally: the frequency sub-param has its own expand button
- Collapse → removes the LFO node, reverts param to static value
- General pattern, not orbit-specific

### 3. Graph view editing (deferred)
- Existing read-only graph view becomes interactive
- Add nodes, drag wires between ports
- Lower priority — canvas overlay covers most common flows more naturally

### 4. Side panel structural editing (deferred)
- List-driven alternative to graph view editing
- Likely redundant with graph view — one or the other

## Storage
Local storage, following the existing import-algorithm pattern.

## Open questions
- Which surface is the MVP — canvas overlay or parameter modulation?
- Does canvas overlay require hittable geometry from render nodes, or is it overlaid separately?
- How do you bootstrap a brand new algorithm from scratch (empty canvas)?
