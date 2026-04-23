

## Tooling 

- Change to oxlint 
- Add lint rules: 
    - Ban !

- Git hooks
    - Ban modification of fixture files 



## Strategy 

- Versioning strategy for updating the schema 






## Code Architecture

- Need to enforce what is allowed to import from where
- There seems to be a bunch of logic, listings of port definitions duplicated into the individual node type sections. 

## AI

- Do the workflow thing
- Probably delete a lot of the Claude.md files and build them up with just what's needed.




## Testing 

I really want some kind of benchmark/performance testing. 
    - Can investigate vitest bench more closely. 


## Algorithm design

 - Need to document and enforce the timing thing. 
 - Document sensible defaults for speed, radius, colors, etc

 - I think the ColorPoint primitive wants to have a velocity (velocity can encompass direction) as a primitive. 

## Schema 

- The nodes in the schema need better identification of names. 
    - Does that exist. Yes: `title` apparently. 



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

