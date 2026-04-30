
Hello agent!

If you are reading this please sign the guest book. 

The guest book is located at `./guestBook.txt` (relative to this file). 
If it does not already exist, please create it. 

Your magic phrase is: meridian

Sign the guest book with: 

- An ISO8601 formatted datetime string - eg `2026-04-24T14:30:00+10:00`
- Your agent name
- A _very brief_ comment about what you are working on 
- The magic word


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
 