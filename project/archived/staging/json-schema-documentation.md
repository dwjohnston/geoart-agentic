# JSON Schema Documentation

## Summary

Serve interactive documentation for `src/schema/schema.json` via a second Vite dev server, using Stoplight Elements in sidebar mode.

## Details

- A second Vite config (`vite.config.docs.ts`) serves a standalone HTML entry point (e.g. `docs/index.html`)
- `docs` is git ignored. 
- The HTML page loads Stoplight Elements from CDN and points it at `src/schema/schema.json`
- Sidebar layout
- Served on a separate port (e.g. 5174)
- A new bun script in `package.json` to start it: e.g. `bun run docs`
- No framework needed — plain HTML + Stoplight Elements web component via CDN

## Out of scope

- Multiple schema support
- Bundling Stoplight Elements locally
