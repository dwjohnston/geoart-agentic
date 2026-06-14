# compute-node handoff: rotate

The `rotate` node rotates each input point about each rotation center by `rotationAmount * 2π` radians (CCW). With `inputPoints: [(1,0,red)]`, `rotationCenters: [(0,0)]`, `rotationAmount: 0.25` it produces `[(0,1,red)]`. With 2 input points and 2 centers it produces 4 output points.

## Algorithm skeleton

```ts
{
  id: 'rotate',
  type: 'rotate',
  params: {
    inputPoints: { ref: 'someSource.points' },
    rotationCenters: { v: [{ v: { x: 0.25, y: 0.25, dx: 0, dy: 0, r: 1, g: 1, b: 1, a: 1 } }] },
    rotationAmount: { ref: 'someWave.value' },
  },
},
```
