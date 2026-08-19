I want to put this appliction to bed. I'm unable to work on it. 


So high level, we want to get this thing deployed somewhere, looking and looking somewhat polished. 


So: 


## CLean up 

- Remove unused/depreacted fields and nodes in the schema. 

- Big tidy up of reference algorithms. 
   - Make sure all nodes have at least one reference algorithm
   - Remove any sample algorithms that aren't very interesting
   - Have everything be grouped properly 



## UX Polish 

- All modules documented
- Expermiment with pulling the render controls into the module control. But you still need a way of toggling all of a type. 
- Have module nodes render in the graph view. 
- Include graph description on the page. 
- Include title. Geoart 3000. 
- Add favicon, page title 

### Mobile 

- Kind of not supporting mobile. 

#### First pass

- Just render the display, no controls

#### Second pass

- Make the controls mobile friendly and have a way of displaying them. 

No builder for mobile.



## TypeScript builder 

I'm giving up on the concept of a drag and drop or other module building functionality. 

Instead, just let the user write typescript themselves!

So probably use something like monaco to achieve this. 


### Improve the builder semantics 


### How does this interact with the current sharing mechanism? 

**Also** Sounds like a security risk, evaling some code? I'm sure there's a way to do it nicely. 

We still want the ability to do the JSON based share/import/export - that's useful for other contexts. 



## Very nice to have

- Meta schema - should be easy? 
- I really would like the algorithm preview in github PRs working. 

## Social shares abnd server side rendering 

- Need server side renderingn to render an image for social share. 
   - One security concern, people could abuse compute by providing algorithms with millions of nodes for example. Need to have some kind of tightening. 
      - Also if we are deploying to cloud flare edge workers, need some maximum render time. 
    - Also want server side render and share of gifs, for reddit. 


## Miscellaenous 

- Export react components - for embedding elsewhere. 



## Deploy

Not much to say here. I want to experiment with deploying to Cloudflare

## Observability 

Just something basic, you guide me on this. 