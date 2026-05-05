# LFO Planets

Two planets (Earth and Venus) orbit the canvas centre. Speed and radius of each planet are driven by LFO wave nodes rather than static sliders. A spirograph line is painted between them each tick.

## Controls

Per planet × 2 (Earth, Venus):
- Color picker
- Speed LFO frequency slider (how fast the speed oscillates)
- Speed LFO amplitude slider (depth of speed wobble)
- Radius LFO frequency slider
- Radius LFO amplitude slider

## Compute

- `time` node
- 4 `wave` nodes (earthSpeedLFO, earthRadiusLFO, venusSpeedLFO, venusRadiusLFO) — each wired to time, frequency slider, amplitude slider
- 2 `orbit` nodes — speed and radius driven directly from LFO outputs
- 2 `colorPoint` nodes

## Render

- **paint**: `timedLine` between Earth and Venus colorPoints (every 10 ticks, ~50% opacity)
- **live**: grey orbit-path circle per planet (radius from LFO), coloured dot per planet at current position

No trail circles. No static speed/radius sliders — LFOs drive those ports entirely.

## Notes

- Speed amplitude range allows negative values (reverse orbit)
- Radius amplitude range: 0–0.5 (canvas is 1×1)
- Default colours: Earth = blue (0.3, 0.7, 1, 0.5), Venus = yellow (1, 0.8, 0.2, 0.5)
