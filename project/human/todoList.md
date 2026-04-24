

## Tooling 

- Change to oxlint / biome? We need a formatter. 
- Add lint rules: 
    - Ban !

- Enforce file name conventions. 
- Enforce node titles in schema. Just via test? 

- Git hooks
    - Ban modification of fixture files 

## Quality of Life

- Add a tick count debug somewhere
- Tidy up those controls
- ~~Run the commit hooks simultaneously~~


## Strategy 

- Versioning strategy for updating the schema 


## Code Architecture

- Need to enforce what is allowed to import from where
- There seems to be a bunch of logic, listings of port definitions duplicated into the individual node type sections. 

- The graphEngine - registration logic doesn't need to be graphEngine.ts - that can probably be pulled out to the compute nodes. 



## AI

- ~~Do the workflow thing~~
- ~~Probably delete a lot of the Claude.md files and build them up with just what's needed.~~

- Put in: the timing thing. 

- Need to archive the staging .md files 


- Have a kind of cron job to run schema agent regularly? 
- Update the guest book instructions to be an iso date time string, with local timestamp. 


## Testing 

I really want some kind of benchmark/performance testing. 
    - Can investigate vitest bench more closely. 


## Algorithm design

 - Need to document and enforce the timing thing. 
 - Document sensible defaults for speed, radius, colors, etc

 - I think the ColorPoint primitive wants to have a velocity (velocity can encompass direction) as a primitive. 


## Nodes

- Deprecate timedLine - all drawers should be between arrays of points. 
- Deprecate orbits - all point makers should give arrays of points. 
    - But do they also have an array of points as a center? I suppose they can!
    - Nah... I feel like the problem with that would be:
        - Let's say you have a single orbit (A), it has three nodes on it. 
        - Now we have another orbit (B), and its center reference is the points of A - so one node, but actually three orbits. 
        - B has a value of 3 nodes - so actually ends up being 9 points. 
        - Now, if we are going to link all of those to the same place(s), this is fine, but its conceivable that we want to do one group of three to X, one group of three to Y and so forth. 
            - _maybe_ you could do a thing where the output positions of a orbit are actually a 2d array - and then the linker, it can actually accept a a single point, or an array of points, or an array of array of points... But where does it end? 
                - For example, take orbit B its output be the center of Orbit C, now we have a 3d array of positions. 
                - So really a linker needs to be able to deal with arrays of any dimensionality. 
                    - This might be doable - you could have different modes for determining how do deal with a multi dimiensional array: 
                        - flat - just flatten them and do the same thing to each one
                        - Do a different think per grouping
                        - cycle - flatten them, and then do treat them diffently per treatment option we have. (for example, for a link, we have a from 3d array with 27 points, and a to node which is a single array of 3 points)



## Schema 

- ~~The nodes in the schema need better identification of names.~~ 
    - Does that exist. Yes: `title` apparently. 
- Assess the documentation of the schema




## Future state: 


- The concept of 'modules' or something, that allow the wiring of controls, nodes etc, with less boilerplate
- Alternative inputs types: 
    - Clicking on the screen (eg for game of life)
    - Camera input. 
    - Both of these are really just multi dimensional matrix inputs. 

- Encoding algorithms, parameter state into URL
- Some kind of drag drop editor/visualiser
- Some kind of AI prompting functionality. 
- Responsive design 

