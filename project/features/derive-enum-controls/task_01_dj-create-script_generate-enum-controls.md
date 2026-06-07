# Task 01 — Create generate-enum-controls script

## Skill
`dj-create-script`

## Goal

Create a generation script that reads `src/schema/schema/value-kinds.schema.json`, finds all enum value kinds (names ending in `EnumValue`), and writes corresponding control entries to `src/schema/schema/enum-controls.schema.generated.json`.

## Steps

1. Examine `src/schema/schema/value-kinds.schema.json` to understand the enum value kind structure.
2. Examine `src/schema/schema/schema.json` to find the existing hand-written enum control entries and understand the expected output format.
3. Examine an existing `.schema.generated.json` file and its generation script to match the output format and script conventions.
4. Write the script at `src/schema/scripts/generate-enum-controls.ts` (or `.js` — follow project conventions).
5. Wire the script into the `bun generate:derived-schema` command in `package.json`.
6. Run `bun generate` and verify `enum-controls.schema.generated.json` is produced with one entry per enum value kind.
7. Remove the hand-written enum control entries from `schema.json`.
8. Run `bun validate` and confirm the project builds and type-checks cleanly.

## Acceptance Criteria

1. `bun generate` produces `src/schema/schema/enum-controls.schema.generated.json` with one entry per enum value kind.
2. The hand-written enum control entries are absent from `schema.json`.
3. `bun validate` passes cleanly.
