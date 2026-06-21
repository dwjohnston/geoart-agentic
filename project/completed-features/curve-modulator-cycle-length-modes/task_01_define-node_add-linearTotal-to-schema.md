# Task 01 — define-node: Add `linearTotal` to cycleLengthModeEnum

## Goal

Add `"linearTotal"` as a third enum value to `cycleLengthModeEnumValue` in the schema, then regenerate derived types.

## File to Edit

`src/schema/schema/value-kinds.schema.json`

Find the `cycleLengthModeEnumValue` definition:

```json
"cycleLengthModeEnumValue": {
  ...
  "properties": {
    "v": {
      "type": "string",
      "enum": [
        "arrayLength",
        "linearOne"
      ]
    }
  }
}
```

Add `"linearTotal"` to the enum array:

```json
"enum": [
  "arrayLength",
  "linearOne",
  "linearTotal"
]
```

## After Editing

Run `bun generate` to regenerate all derived types.

Verify `src/schema/_generated/value-kinds-2.ts` now includes `"linearTotal"` in `V_cycleLengthModeEnumValue`.

Run `bun typecheck` to confirm no type errors.
