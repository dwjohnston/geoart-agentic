# Task 02 Handoff — compute-node: Reflect & Rotate Color Shift

## Implementation approach

Shared helper file at `src/nodes/compute/colorShiftOperations.ts` (placed outside `nodes/` to avoid auto-registration by the registry generator). Exports:

- `applyColorShiftOperation(input, rr, driver, op)` — applies one of the five operations
- `computeDriver(px, py, rrX, rrY, axisX, axisY)` — returns signed driver in −1..+1

Both `reflect.ts` and `rotate.ts` import these and apply them after their geometric transform when `colorShiftOperation !== 'none'`.

## Driver calculation

```
driver = (vy * dnx - vx * dny) / distance
```

Where `(vx, vy) = (input.x − rr.x, input.y − rr.y)` and `(dnx, dny)` is the normalised axis. This is the **perpendicular (cross-product) component** of the unit r/r→input vector relative to the axis — giving driver = 0 for points on the axis and ±1 for maximally-displaced points.

- **Reflect**: axis = mirror direction `(r.dx, r.dy)` (already used for geometry)
- **Rotate**: axis = center's `(dx, dy)`, falling back to `(1, 0)` when zero

## Falloff constant

The brief specifies a constant falloff; the driver is purely angle-based (no distance weighting). Driver range is exactly −1..+1.

## Test values

Tests are in `src/nodes/compute/colorShiftOperations.test.ts` and target the helpers directly. Key values:

- blend driver=0.5: red → `(0.5, 0, 0.5, 1)` (halfway to blue)
- hue-shift driver=0.5: red + green rr → yellow `(1, 1, 0, 1)`
- lighten driver=1.0: grey + grey → `(0.75, 0.75, 0.75, 1)` (screen)
- saturate driver=1.0: pale red + grey → `(0.5, 0.5, 0.5, 1)` (desaturated)
