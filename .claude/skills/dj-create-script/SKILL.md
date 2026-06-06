---
name: dj-create-script
description: Create or modify generation scripts.
---

## Authoring Generation Scripts

This project makes frequent use of scripts that derive code or structured data from other code or structured data.

For example, scripts:

- Create index files
- Derive typings from JSON Schema
- Derive other JSON schemas from JSON Schema
- Update LLM prompt files

Scripts should always be kept in a `scripts` folder at the `src/*/*` level.

e.g. at `src/schema/scripts` or `src/algorithms/scripts`

Generated files should always be output to either a `_generated` folder or a `*.generated.*` file. Files matching these patterns are `.gitignore`d.

Scripts should be launchable from a `generate:*` package script:

```
bun run generate:derived-schemas
```

All generation scripts should be included as part of the base `generate` script, so they can be run with:

```
bun run generate
```

Unless otherwise specified, scripts do not receive file paths via arguments. Hard-coding the file paths is OK.

Scripts should be structured as a 'runnable module':

```ts
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

Scripts should be tested. Take an 'at least write one test' strategy — you do not need comprehensive test cases; the user will prompt for more if needed. If extending a script, include a test for the new functionality.

Scripts should include a comment at the top of the file describing what the script does.

