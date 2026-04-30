# Sensible Defaults

## Canvas coordinates

The coordinate space spans `-1` to `+1` on both axes, with `(0, 0)` at the centre and positive y pointing up. An orbit radius of `0.5` reaches halfway to the edge; `1.0` reaches the canvas boundary.

## Speed sliders

Always allow negative values — negative speed runs the animation in reverse.

| | Value |
|---|---|
| Default | `0.15` |
| Min | `-5` |
| Max | `5` |

## Orbit radius

| Situation | Default |
|---|---|
| Centre is fixed at `(0, 0)` | `0.5` |
| Centre is dynamic (driven by another orbit) | `0.25` |

## Colours

Marks that accumulate on the paint layer should use ~50% alpha (`a: 0.5`) so the pattern builds gradually rather than saturating immediately. Full opacity (`a: 1`) is correct for live-layer position indicators.

## Orbit display

For every orbiting body, draw two things:

1. A small grey circle on the **paint layer** with `intervalTicks: 1` — traces the orbital path over time
2. A coloured dot on the **live layer** (no `intervalTicks`) — shows the current position each frame

Use `{ r: 0.5, g: 0.5, b: 0.5, a: 0.5 }` for the trail. Match the dot colour to the body's `colorPoint` if one exists, otherwise grey.

## Timing units

The engine runs at approximately 60 ticks per second.

- **`intervalTicks`** — a count of ticks, not milliseconds. `intervalTicks: 60` fires roughly once per second.
- **`frequency`** — cycles per 60 ticks. `frequency: 1` completes one full cycle per second; `frequency: 0.5` takes two seconds per cycle.

## Paint interval

`intervalTicks: 10` is a good starting point for lines and marks that accumulate a spirograph pattern. Always expose this as a slider control so the user can tune the density.

## LFO parameters

| Param | Min | Max | Default | Notes |
|-------|-----|-----|---------|-------|
| `amplitude` | `0` | `1` | `0` or very low | Start silent — let the user dial it in |
| `frequency` | `0.001` | `1` | `0.5` | Cycles per 60 ticks. Must never be `0` — zero frequency is meaningless |

## Link rate

Every algorithm must include at least one link rate slider so the user can control how fast marks accumulate on the paint layer.

## Node port defaults

When implementing a node, set defaults that allow it to produce visible output with no params wired. For example:

- A `wave` node should default to a non-zero amplitude and frequency so it oscillates visibly
- An `orbit` node should default to a non-zero radius and speed so it moves
- A render node's `color` default should have non-zero alpha so something is actually drawn
