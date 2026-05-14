---
name: dj-create-script
description: Create or modify generation scripts. 

---

This project makes frequent use of scripts that will derive code or structured data from other code or structured data

For example, scripts

- Create index files
- Derive typings from JSON Schema
- Derive other JSON schemas from JSON Schema
- Update LLM prompt files

Scripts should always be kept in a `scripts` folder in the `src/*/*` level. 

eg. at `src/schema/scripts` or `src/algorithms/scripts`

Generated files should always be outputted to either a `_generated` folder or a `*.generated.*` file. 
These files matching these patterns are .gitignored.


Scripts should be launchable from a `generate:*` package script. 

eg. 

```
bun run generate:derived-schemas
```

All generation scripts included as part of the base `generate` script, so they can be run with:

```
bun run generate
```


Unless otherwise specified - scripts do not recieve file paths via arguments. Hard coding the file paths is OK. 

Scripts should be structured as a 'runnable module'. 

For example 

```
export function processData(input) {
 // implementation
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
    const inputData = fs.readFileSync(....); 
    const result = processData(inputData); 
    fs.writeFileSync(....); 
}
```

Scripts should be tested. 

Take a 'at least write one test' strategy. You do not need to write comprehensive test cases, if more test cases are needed the user can prompt you for it. 

If being asked to extend a script, include a test for this new extended functionality. 

Scripts should include a comment at the top of the page describing what the test does. 




