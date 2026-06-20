# Feature Brief: Reflect & Rotate Color Effects

## Overview

The reflect and rotate compute nodes currently ignore the color of their reflection/rotation points — the r/r point's color is passed in but has no effect on output colors. This feature adds a `colorShiftOperation` parameter to both nodes that uses the r/r point's color to transform the colors of the output points.

## Schema Changes

A single optional parameter is added to `reflect`, `rotate`, `reflect-module`, and `rotate-module`:

```
colorShiftOperation: "none" | "blend" | "hue-shift" | "lighten" | "saturate"
```

Default (omitted or `"none"`): current behaviour — input color is copied as-is. Fully backward compatible.

## Driver: Proximity-Angle (baked in)

The effect is always driven by the combined proximity-angle driver. **This is not a parameter** — strength and falloff constants are baked into the implementation.

```
driver = falloff(distance) * cos(angle)  →  range: -1..+1
```

Where:
- `distance` = Euclidean distance from the input point to the r/r point
- `angle` = angle of the vector from r/r point to input point, relative to the mirror axis (reflect) or rotation axis (rotate)
- `falloff` = decreasing function of distance (constant in implementation)

Geometric meaning:
- **driver = 0** (angle = 90°, point on mirror/axis): no effect — this is the "same point" case
- **driver = +1** (angle = 0°, far from r/r): maximum positive effect
- **driver = -1** (angle = 180°, far from r/r, opposite side): maximum negative (opposite) effect
- Points close to the r/r center: weak effect regardless of angle (small separation between original and reflected copy)

## Operations

### `none`
No effect. Input color copied as-is. Current behaviour.

### `blend`
Lerps each channel toward the r/r color on the positive side, toward the complement of the r/r color on the negative side.

- driver > 0: output channel lerps toward r/r channel value
- driver = 0: no change
- driver < 0: output channel lerps toward `1 - r/r channel value` (complement)
- Alpha participates as a fourth channel

### `hue-shift`
Rotates the hue of the input point toward the r/r color's hue on the positive side, in the opposite direction on the negative side. Operates in HSL space.

- driver > 0: hue shifts toward r/r hue
- driver = 0: no change
- driver < 0: hue shifts away from r/r hue (opposite arc around the hue wheel)
- The r/r point's alpha scales the magnitude of the hue rotation (higher alpha = stronger shift)
- Output alpha is unchanged from the input point

### `lighten`
Screens toward the r/r color on the positive side, multiplies on the negative side.

- driver > 0: screen blend toward r/r color (lightens)
- driver = 0: no change
- driver < 0: multiply by r/r color (darkens)
- Alpha participates as a fourth channel

### `saturate`
Pushes saturation toward the r/r color's saturation on the positive side, away from it on the negative side. Operates in HSL space.

- driver > 0: saturation shifts toward r/r saturation
- driver = 0: no change
- driver < 0: saturation shifts away from r/r saturation
- Alpha participates as a fourth channel

## Null Channel Handling

- If any required channel on the **input point** is null: skip the effect for that point, pass color through unchanged (preserve nulls).
- If a channel on the **r/r point** is null: that channel is treated as a no-op (the input channel is not modified for that dimension).
- For `hue-shift`: requires all three RGB channels to be non-null on the input point. If any is null, pass through.

## Affected Nodes

| Node | Type |
|---|---|
| `reflect` | compute |
| `rotate` | compute |
| `reflect-module` | module |
| `rotate-module` | module |

Module nodes delegate to their underlying compute nodes, so schema changes propagate naturally.

## Test Cases

Tests target the color shift helper functions directly, with driver value as input rather than full node geometry. This isolates the color math from geometric computation.

### `none`

| Input color | r/r color | driver | Expected output |
|---|---|---|---|
| r=1 g=0 b=0 a=1 | r=0 g=0 b=1 a=1 | 1.0 | r=1 g=0 b=0 a=1 (unchanged) |

### `blend`

| Input color | r/r color | driver | Expected output |
|---|---|---|---|
| r=1 g=0 b=0 a=1 | r=0 g=0 b=1 a=1 | 0.0 | r=1 g=0 b=0 a=1 |
| r=1 g=0 b=0 a=1 | r=0 g=0 b=1 a=1 | 1.0 | r=0 g=0 b=1 a=1 |
| r=1 g=0 b=0 a=1 | r=0 g=0 b=1 a=1 | 0.5 | r=0.5 g=0 b=0.5 a=1 |
| r=1 g=0 b=0 a=1 | r=0 g=0 b=1 a=1 | -1.0 | r=1 g=1 b=0 a=0 (complement of blue, fully lerped) |

### `hue-shift`

Red input + green r/r gives a clean 120° shift. r/r alpha scales the shift magnitude.

| Input color | r/r color | driver | Expected output |
|---|---|---|---|
| red (hue=0°) | green (hue=120°) a=1 | 0.0 | red (no change) |
| red (hue=0°) | green (hue=120°) a=1 | 1.0 | green (fully shifted to r/r hue) |
| red (hue=0°) | green (hue=120°) a=1 | 0.5 | yellow (hue=60°, halfway) |
| red (hue=0°) | green (hue=120°) a=1 | -1.0 | blue (hue=240°, opposite arc) |
| red (hue=0°) | green (hue=120°) a=0.5 | 1.0 | yellow (alpha=0.5 halves shift magnitude) |

### `lighten`

Driver is lerp strength: `lerp(input, screen(input, rrColor), driver)` for positive; `lerp(input, multiply(input, rrColor), |driver|)` for negative.

| Input color | r/r color | driver | Expected output |
|---|---|---|---|
| r=0.5 g=0.5 b=0.5 a=1 | r=0.5 g=0.5 b=0.5 a=1 | 1.0 | r=0.75 g=0.75 b=0.75 a=1 (screen) |
| r=0.5 g=0.5 b=0.5 a=1 | r=0.5 g=0.5 b=0.5 a=1 | -1.0 | r=0.25 g=0.25 b=0.25 a=1 (multiply) |
| r=0.5 g=0.5 b=0.5 a=1 | r=0 g=0 b=0 a=1 | 1.0 | r=0.5 g=0.5 b=0.5 a=1 (screen with black = no change) |
| r=0.5 g=0.5 b=0.5 a=1 | r=1 g=1 b=1 a=1 | -1.0 | r=0.5 g=0.5 b=0.5 a=1 (multiply with white = no change) |

### `saturate`

Pale red vs grey gives clean saturation numbers. Driver is lerp strength applied to saturation in HSL space.

| Input color | r/r color | driver | Expected output |
|---|---|---|---|
| pale red HSL(0°, sat=0.5) = rgb(0.75, 0.25, 0.25) | grey (sat=0) a=1 | 1.0 | grey rgb(0.5, 0.5, 0.5) |
| pale red HSL(0°, sat=0.5) = rgb(0.75, 0.25, 0.25) | grey (sat=0) a=1 | -1.0 | pure red rgb(1, 0, 0) |
| any | any | 0.0 | input unchanged |

### Null handling

| Input color | r/r color | driver | op | Expected output |
|---|---|---|---|---|
| r=1 g=null b=0 a=1 | r=0 g=0 b=1 a=1 | 1.0 | blend | r=1 g=null b=0 a=1 (pass-through — input has null channel) |
| r=1 g=0 b=0 a=1 | r=0 g=null b=1 a=1 | 1.0 | blend | r=0 g=0 b=1 a=1 (r/r g=null → g channel unchanged) |

## Reference Algorithm

`rotate-module` with `colorShiftOperation: "hue-shift"`. As orbit points sweep around the rotate point, each copy gets its hue shifted by a different amount based on its angle → produces a rainbow-spread ring of copies.

- An orbit node produces points with a consistent base hue (e.g. red)
- `rotate-module` with `colorShiftOperation: "hue-shift"`, rotate point set to a vivid green
- Drawn to the `paint` (trail) canvas so the colour spread accumulates visibly

## Out of Scope

- `colorShiftStrength` and `colorShiftFalloff` are not exposed as parameters — constants only
- `colorShiftDriver` is not a parameter — always `proximity-angle`
- No new node types
- No changes to render nodes or other compute nodes
