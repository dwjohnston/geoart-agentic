# Feature Brief: Derive Enum Controls from Enum Values

## Problem

Enum types in the schema require a corresponding control component. Currently these control definitions are written manually in `src/schema/schema/schema.json`. This is a redundant step — the information needed to generate them already exists in `src/schema/schema/value-kinds.schema.json`.

## Goal

Automate generation of enum control schema entries via a script, eliminating the need to maintain them by hand.

## Scope

### In scope

- A new generation script at `src/schema/scripts/` that reads `src/schema/schema/value-kinds.schema.json`, finds all enum value kinds (identified by the `EnumValue` suffix), and writes the corresponding control entries to `src/schema/schema/enum-controls.schema.generated.json`.
- The script is wired into the existing `bun generate:derived-schema` command.
- Existing hand-written enum control definitions are removed from `src/schema/schema/schema.json`.

### Out of scope

- Changes to non-enum control types.
- Changes to the runtime control resolution logic.

## Source

- Input: `src/schema/schema/value-kinds.schema.json` — all enum kinds have names ending in `EnumValue`.
- Output: `src/schema/schema/enum-controls.schema.generated.json` — same schema format as other `.schema.json` files in the project.

## Acceptance criteria

1. Running `bun generate` produces `enum-controls.schema.generated.json` with one entry per enum value kind.
2. The hand-written enum control entries are absent from `schema.json`.
3. The project builds and type-checks cleanly after the change.
