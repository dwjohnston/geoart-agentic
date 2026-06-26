# compute-node handoff: reflect

The `reflect` node reflects each input point about every reflection point (product cardinality). Reflecting point (1, 0) about a vertical line through the origin (direction 0, 1) produces (-1, 0). Reflecting (1, 1) about a horizontal line (direction 1, 0) produces (1, -1). Reflecting about an off-centre point works by translate → reflect → translate-back. Reflection points with dx=0, dy=0 are skipped. Color is inherited from the input point. Tangents are also reflected using the same line-reflection formula.

## Partial algorithm skeleton

```ts
{
  id: 'reflect',
  type: 'reflect',
  params: {
    inputPoints: { ref: 'someNode.points' },
    reflectionPoints: { ref: 'anotherNode.points' },
  },
},
```

Round-number test values:
- Input (1, 0), reflection centre (0, 0) direction (0, 1) → output (-1, 0)
- Input (1, 1), reflection centre (0, 0) direction (1, 0) → output (1, -1)
- Input (1, 0), reflection centre (0.5, 0) direction (0, 1) → output (0, 0)
- Input (1, 0), reflection centre (0, 0) direction (1, 1) → output (0, 1)

## Registration

Registered in `src/nodes/compute/registry.generated.ts` as `'reflect'`. Implementation at `src/nodes/compute/nodes/reflect.ts`. Tests at `src/nodes/compute/nodes/reflect.test.ts` (14 tests, all passing).
