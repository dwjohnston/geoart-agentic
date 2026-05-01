

- Value primitive
- Value ref

- Value array primitive
- Value enum primitive
- Value array ref
- Value enum ref

- static value
- reffed value

- node
    - when we talk in terms of 'node' without specifying 
  - compute node
  - render node
  - control node


- declaration
   - Declaring or defining values in the algorithm

- schema definition 
   - Defining the thing (a value primitive or a node) in the schema

- node definition 
    - The thing we declare with `defineXNode` - defines runtime functionality
- node instance
    - A compiled, runtime instance of a node
- node declaration 
    - The bit of JSON/JS that declares a node in an algoirithm

- algorithrm
   - 'validate the algorithm' means to validate 

- the schema
    - 'validate the schema' means to validate the JSON schema itself

- value kind 
- value instance

- node input
- node ouput

- compiler
- node registration
    - This is calling the `defineXNode` function 


- tick
- frequency
     - Is there a better way of communicating values of less than 1? 



## Terms to be avoided

- type 
   - Type is a resereved keyword in TypeScript, and the term is ambigious - do we mean type as in a typescript type? Or just generally as 'the kind of thing'. Use the term `kind` instead for this latter usage. 