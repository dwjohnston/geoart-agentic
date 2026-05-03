## Terminology 

paint = permenant layer
draw = temp layer



## Guidelines for creating algorithms

| Guideline | Detail |
|---|---|
| Speed property | Allow negative values (runs in reverse) |
| Canvas dimensions | Height and width are both `1`. Max circle radius = `0.5` |
| Painting lines | Every 10th tick is a good interval (ticks, not ms; ~60 ticks/second) |
| Default paint colour | ~50% opacity |
| Orbits | Draw a circle for the orbit path (grey) and the node itself (match colorpoint if provided, else grey) |
| Other entities | Same rule as orbits — draw the entity marker (e.g. point on a line) |
| Link rate | Always include a control to change it |
| LFO defaults | Amplitude `0`–`0.2`, frequency `0.001`–`1` cycles per 60 ticks |
| Frequency minimum | Must not be `0` (meaningless) |
| Timing units | `intervalTicks` = number of ticks; frequency = cycles per 60 ticks (~1 second) |
