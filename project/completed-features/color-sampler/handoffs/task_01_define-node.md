# define-node handoff: color-sampler schema

## Value Kinds Added

- `colorSamplerValue` — runtime-only placeholder; actual value is a `ColorSampler` object at runtime
- `colorSamplerModeEnumValue` — enum with values: `clobber`

## TypeScript Type Added (`src/schema/typeHelpers.ts`)

```typescript
export type ColorSampler = {
  sample(t: number): { r: number; g: number; b: number; a: number }
}
```

## New Compute Nodes

### `valueSampler`
| Port | Direction | Type |
|---|---|---|
| `value` | input | `numberValueOrRef` |
| `sampler` | output | `samplerValue` |

Wraps a static number as a sampler that always returns that value.

### `colorSampler`
| Port | Direction | Type |
|---|---|---|
| `sampleR` | input | `samplerValueOrRef` |
| `sampleG` | input | `samplerValueOrRef` |
| `sampleB` | input | `samplerValueOrRef` |
| `sampleA` | input | `samplerValueOrRef` |
| `mode` | input | `colorSamplerModeEnumValueOrRef` |
| `colorSampler` | output | `colorSamplerValue` |

Combines four channel samplers into a single ColorSampler returning `{ r, g, b, a }`.

## New Control Node

### `colorSamplerModeSelector`
| Port | Direction | Type |
|---|---|---|
| `label` | param | `stringValue` |
| `value` | param | `colorSamplerModeEnumValue` |
| `mode` | output | `colorSamplerModeEnumValue` |

Dropdown selector for `colorSamplerModeEnumValue`.

## Updated Compute Nodes

### `orbit` — added optional input
- `colorSampler` — `colorSamplerValueOrRef` (optional; defaults to `null`)

### `pointsOnALine` — added optional input
- `colorSampler` — `colorSamplerValueOrRef` (optional; defaults to `null`)

## Key Names for Downstream Tasks

- Enum value kind: `colorSamplerModeEnumValue`
- Enum values: `clobber`
- Control node type: `colorSamplerModeSelector`
