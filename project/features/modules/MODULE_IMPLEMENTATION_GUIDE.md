# Module Implementation Guide

## Overview

Module implementations generate internal nodes that are wired together to create reusable abstractions. This guide covers the mechanics of implementation.

## Declaring Refs in Module Implementations

When wiring internal nodes together, use refs to connect outputs to inputs:

### Static Values vs Refs

- **Static value**: `{ v: someValue }` — a literal constant
- **Ref**: `{ ref: "nodeId.portName" }` — a reference to another node's output

### Direct Refs (Output → Input)

When the source output type matches the target input type exactly, use a direct ref:

```ts
// Source: orbit node outputs colorPointArrayValue
// Target: circle node expects centerPointsArrayValue
params: {
  centerPoints: { ref: `${orbitNodeId}.points` }
}
```

### Array Assembly (Multiple Scalars → Array)

When assembling an array from multiple scalar refs, wrap each ref:

```ts
// Assembling multiple number refs into a numberArray
params: {
  values: { v: [{ ref: 'slider1.value' }, { ref: 'slider2.value' }] }
}
```

## Key Rules

1. **Array types pass through directly** — don't wrap array-to-array refs in `{ v: [...] }`
2. **Scalar-to-array requires wrapping** — wrap individual scalar refs in `{ v: [{ ref: ... }] }`
3. **Type compatibility** — ensure the source output valueType matches the target input valueType

## Example: Orbit Module

```ts
// ✓ Correct: array output → array input
colorPointsArray: { ref: `${orbitNodeId}.points` }

// ✗ Wrong: wrapping an array type in { v: [...] }
colorPointsArray: { v: [{ ref: `${orbitNodeId}.points` }] }
```

## Control Node Integration

When generating control nodes based on config, wire them to internal compute nodes:

```ts
// Generate a slider if config.controls.speed is true
if (config.controls?.speed) {
  const sliderId = createInternalId(moduleId, 'speed-slider');
  controlNodes.push({ /* slider definition */ });
  
  // Wire the slider to the orbit node
  params: {
    speed: { ref: `${sliderId}.value` }
  }
}
```

## Render Node Integration

Render nodes consume outputs from compute nodes:

```ts
// Connect orbit output to circle render
params: {
  centerPoints: { ref: `${orbitNodeId}.points` },
  radius: { v: 0.015 },
  // ...
}
```

## Node ID Namespacing

Use `createInternalId(moduleId, localId)` to generate namespaced IDs:

```ts
import { createInternalId } from './moduleUtils';

const orbitNodeId = createInternalId(moduleId, 'orbit');
// Result: "my-orbit:orbit"
```

This prevents naming conflicts when multiple module instances are used.
