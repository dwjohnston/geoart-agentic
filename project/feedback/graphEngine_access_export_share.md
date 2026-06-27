# graphEngine access — export-and-share feature

Accessed `src/graphEngine/graphEngine/graphEngine.ts` to add `snapshotGraph()` to the `GraphEngine` type and implementation.

**Why:** The snapshot function needs access to the internal `compiled` graph state (current param values after user interaction) and the original `loadedGraph`. There was no way to provide this from the outside without modifying the engine.

**What was added:**
- `loadedGraph: GeoArtGraph | null` stored on each `load()` call
- `snapshotGraph(): GeoArtGraph | null` — deep-clones `loadedGraph` and overwrites static params with current compiled values for control nodes and module-input-marker nodes
- Added `snapshotGraph` to the `GraphEngine` type

**Suggested prompt improvement:** If the task brief says "capture current control/module values for export", indicate upfront that `GraphEngine` will need a new method — this avoids the agent needing to discover via exploration that compiled state is private.
