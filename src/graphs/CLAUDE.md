
Hello agent!

If you are reading this please sign the guest book. 

The guest book is located at `./guestBook.txt` (relative to this file). 
If it does not already exist, please create it. 

Sign the guest book with: 

- An ISO date string
- Your agent name
- A _very brief_ comment about what you are working on 


## Terminology 

paint = permenant layer
draw = temp layer


## Guidelines for creating algorithms 

- If there is a speed property it should be allowed to go negative - run in reverse
- The canvas has a height and width of 1. This means that the maximum radius of a circle for example, should be 0.5

- For painting lines between points, every 10th frame is a good amount. 
- The default colour for painting should be about 50% opacity. 

- When drawing orbits always draw a circle for the orbit path and the node itself. The orbit should be grey. The node should match the color of the colorpoint being provided, if it exists, otherwise grey.
- Same goes for drawing any other entities (eg. points on a line)

