# Feature Brief: Export and Share

## Overview

Add two export/share buttons to the UI. Both encode the algorithm with current runtime values baked in as static values.

## Buttons

### Share

- Encodes the current algorithm as a base64 string
- Sets `?a=<base64>` in the URL, replacing any existing query string
- Copies the full URL to the clipboard
- Shows a "Link copied!" toast

### Export JSON

- Opens a modal/dialog containing the algorithm JSON as formatted text
- Dialog includes a "Copy to clipboard" button
- No download option

## Value Snapshotting

Before encoding, the algorithm's static values must be updated to reflect the current runtime state. Two node types may have values that differ from the schema default:

- **Control nodes** — the current control value (whether previously set as a static value or defaulted)
- **Module nodes** — the current module-level value (same rule)

In both cases, the snapshot must write an explicit static value, even if the node was previously using a default.

## Loading from `?a=` on Page Load

- If `?a=<base64>` is present in the URL on load, decode and load the algorithm silently
- No toast or feedback
- The algorithm selector UI should show in an unselected/blank state (the loaded algorithm is not one of the named presets)

## Out of Scope

- Download as file
- Merging `?a=` with other query params
- Any UI for the import flow beyond the algorithm selector state
