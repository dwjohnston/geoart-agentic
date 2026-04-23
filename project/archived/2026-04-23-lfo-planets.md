# LFO Planets — Execution Plan

## Status

| Task | Agent | Status |
|------|-------|--------|
| A: Implement graph file | algorithm-agent | done |
| B: Register in index | algorithm-agent | done |
| C: Run compile tests | algorithm-agent | done |
| D: Add base speed/radius — BLOCKED | — | parked |

**Parked on branch:** `feature/lfo-planets`

Blocked: adding base speed/radius values (base + LFO) requires an `add` node that does not yet exist in the compute layer.

## Dependency Graph

```
A (create lfoPlanets.ts) → B (register in index.ts) → C (run tests)
```

All three steps are sequential. One agent handles all three.

---

## Task A — Create `src/graphs/lfoPlanets.ts`

### Agent: algorithm-agent

Create the file `/Users/davidjohnston/claude-workspace/geoart/app/src/graphs/lfoPlanets.ts`.

Use `GeoArtGraph` from `'../schema/_generated/schema-types'` (see earthVenus.ts and threeOrbits.ts for reference).

### Control nodes (8 sliders + 2 colour pickers)

**Earth:**
- `earthColor` — colorPicker, label "Earth Color", default `{ r:0.3, g:0.7, b:1, a:0.5 }`
- `earthSpeedFreq` — slider, label "Earth Speed LFO Freq", min: -5, max: 5, step: 0.01, default: 0.3
- `earthSpeedAmp` — slider, label "Earth Speed LFO Amp", min: 0, max: 3, step: 0.01, default: 0.5
- `earthRadiusFreq` — slider, label "Earth Radius LFO Freq", min: -5, max: 5, step: 0.01, default: 0.1
- `earthRadiusAmp` — slider, label "Earth Radius LFO Amp", min: 0, max: 0.5, step: 0.01, default: 0.25

**Venus:**
- `venusColor` — colorPicker, label "Venus Color", default `{ r:1, g:0.8, b:0.2, a:0.5 }`
- `venusSpeedFreq` — slider, label "Venus Speed LFO Freq", min: -5, max: 5, step: 0.01, default: 0.47
- `venusSpeedAmp` — slider, label "Venus Speed LFO Amp", min: 0, max: 3, step: 0.01, default: 0.8
- `venusRadiusFreq` — slider, label "Venus Radius LFO Freq", min: -5, max: 5, step: 0.01, default: 0.17
- `venusRadiusAmp` — slider, label "Venus Radius LFO Amp", min: 0, max: 0.5, step: 0.01, default: 0.2

### Compute nodes

- `time` — type: 'time', params: {}
- `earthSpeedLFO` — type: 'wave', params: { time: ref('time.time'), frequency: ref('earthSpeedFreq.value'), amplitude: ref('earthSpeedAmp.value') }
- `earthRadiusLFO` — type: 'wave', params: { time: ref('time.time'), frequency: ref('earthRadiusFreq.value'), amplitude: ref('earthRadiusAmp.value') }
- `venusSpeedLFO` — type: 'wave', params: { time: ref('time.time'), frequency: ref('venusSpeedFreq.value'), amplitude: ref('venusSpeedAmp.value') }
- `venusRadiusLFO` — type: 'wave', params: { time: ref('time.time'), frequency: ref('venusRadiusFreq.value'), amplitude: ref('venusRadiusAmp.value') }
- `earthOrbit` — type: 'orbit', params: { time: ref('time.time'), speed: ref('earthSpeedLFO.value'), radius: ref('earthRadiusLFO.value') }
- `venusOrbit` — type: 'orbit', params: { time: ref('time.time'), speed: ref('venusSpeedLFO.value'), radius: ref('venusRadiusLFO.value') }
- `earthCP` — type: 'colorPoint', params: { point: ref('earthOrbit.point'), color: ref('earthColor.value') }
- `venusCP` — type: 'colorPoint', params: { point: ref('venusOrbit.point'), color: ref('venusColor.value') }

### Render nodes

**paint layer:**
- `line` — type: 'timedLine', layer: 'paint', params: { intervalTicks: { v: 10 }, colorPointA: ref('earthCP.colorPoint'), colorPointB: ref('venusCP.colorPoint') }

**live layer (per planet — orbit path circle + position dot):**
- `earthOrbitPath` — type: 'circle', layer: 'live', params: { center: { v: { x:0, y:0 } }, radius: ref('earthRadiusLFO.value'), color: { v: { r:0.5, g:0.5, b:0.5, a:0.5 } } }
- `venusPrbitPath` — type: 'circle', layer: 'live', params: { center: { v: { x:0, y:0 } }, radius: ref('venusRadiusLFO.value'), color: { v: { r:0.5, g:0.5, b:0.5, a:0.5 } } }
- `earthDot` — type: 'circle', layer: 'live', params: { center: ref('earthOrbit.point'), radius: { v: 0.02 }, color: ref('earthColor.value') }
- `venusDot` — type: 'circle', layer: 'live', params: { center: ref('venusOrbit.point'), radius: { v: 0.016 }, color: ref('venusColor.value') }

---

## Task B — Register in `src/graphs/index.ts`

Add import:
```typescript
import { lfoPlanetsGraph } from './lfoPlanets';
```

Add entry to GRAPHS array:
```typescript
{ id: 'lfoPlanets', name: 'LFO Planets', graph: lfoPlanetsGraph }
```

---

## Task C — Run tests

```
bun run test:headless --run
```

All tests must pass (including the auto-compile test for lfoPlanets).
