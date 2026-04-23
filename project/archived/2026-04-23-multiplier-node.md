# Multiplier Node — Execution Plan

## Status

| Task | Agent | Status |
|------|-------|--------|
| 1. Update schema | schema-agent | pending |
| 2. Implement node | compute-node-agent | pending |
| 3. Register node | compute-node-agent | pending |
| 4. Write tests | compute-node-agent | pending |

## Dependency Graph

```
[1. schema] ──┬──> [2. implement] ──> [3. register]
              │
              └──> [4. tests] (can run alongside 2 & 3)
```

Tasks 2 and 4 can begin once schema is updated. Task 3 depends on task 2.

---

## Task 1 — Update schema

**File:** `src/schema/schema.json`

Add a new `computeNode` variant for `"multiplier"` following the same pattern as `"wave"`. The node has two modulatable number params (`a`, `b`) with no required params beyond `id` and `type`.

```json
{
  "type": "object",
  "description": "Multiplies two number inputs together",
  "additionalProperties": false,
  "required": ["id", "type", "params"],
  "properties": {
    "id":   { "type": "string" },
    "type": { "type": "string", "enum": ["multiplier"] },
    "params": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "a": { "$ref": "#/definitions/numberParam" },
        "b": { "$ref": "#/definitions/numberParam" }
      }
    }
  }
}
```

---

## Task 2 — Implement node

**File:** `src/nodes/compute/nodes/multiplier.node.ts`

```typescript
import type { NodeDef } from '../types';
import type { NumberValue } from '../../../graph/types';

export const multiplierNodeDef: NodeDef = {
  type: 'multiplier',
  isTimeDependant: false,
  inputs: [
    { name: 'a', type: 'number', default: { kind: 'number', v: 1.0 } },
    { name: 'b', type: 'number', default: { kind: 'number', v: 1.0 } },
  ],
  outputs: [
    { name: 'product', type: 'number' },
  ],
  evaluate(inputs) {
    const a = (inputs[0] as NumberValue).v;
    const b = (inputs[1] as NumberValue).v;
    return [{ kind: 'number', v: a * b }];
  },
};
```

---

## Task 3 — Register node

**File:** `src/nodes/compute/registry.ts`

Add import and entry:

```typescript
import { multiplierNodeDef } from './nodes/multiplier.node';
// ...
[multiplierNodeDef.type, multiplierNodeDef],
```

---

## Task 4 — Write tests

**File:** `src/nodes/compute/nodes/multiplier.test.ts`

Test the `evaluate` function directly via the node def (no pure helper needed — logic is trivial). Cover:

- `1 × 1 = 1` (defaults)
- `0.5 × 0.5 = 0.25`
- `-1 × 0.5 = -0.5`
- `0 × anything = 0`
- default fallback (both inputs at default produce 1)
