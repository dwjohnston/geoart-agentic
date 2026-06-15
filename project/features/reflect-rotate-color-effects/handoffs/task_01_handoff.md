# Task 01 Handoff — define-node: Schema Changes

## New enum value type

**Name:** `colorShiftOperationEnumValue`

**Values:** `"none" | "blend" | "hue-shift" | "lighten" | "saturate"`

Defined in `src/schema/schema/value-kinds.schema.json`.

The refable counterpart `colorShiftOperationEnumValueOrRef` was auto-generated in `refable-value-kinds.schema.json` by `bun generate`.

## Node schemas updated

| Node | Kind | Parameter added |
|---|---|---|
| `reflect` | compute | `colorShiftOperation?: colorShiftOperationEnumValueOrRef` |
| `rotate` | compute | `colorShiftOperation?: colorShiftOperationEnumValueOrRef` |
| `reflect-module` | module | `colorShiftOperation?: colorShiftOperationEnumValueOrRef` |
| `rotate-module` | module | `colorShiftOperation?: colorShiftOperationEnumValueOrRef` |

## Forward compatibility

Defaults added to all four runtime implementations (`'none' as const`) so existing algorithms continue to compile and behave identically. The `evaluate` functions are unchanged — task_02 adds the actual color shift logic.

## Generated TypeScript type

```ts
export interface ColorShiftOperationEnumValue {
  v: 'none' | 'blend' | 'hue-shift' | 'lighten' | 'saturate';
}
export type ColorShiftOperationEnumValueOrRef = ColorShiftOperationEnumValue | RefParam;
```

All 499 tests pass, `bun typecheck` clean.
