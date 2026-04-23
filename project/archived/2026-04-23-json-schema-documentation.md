# Plan: JSON Schema Documentation

## Status

| Task | Agent | Status |
|------|-------|--------|
| 1. Add `docs/` to `.gitignore` | general-purpose | pending |
| 2. Create `docs/index.html` | general-purpose | pending |
| 3. Create `vite.config.docs.ts` | general-purpose | pending |
| 4. Add `docs` script to `package.json` | general-purpose | pending |

## Dependency Graph

```
1 ──┐
2 ──┼──► 4
3 ──┘
```

Tasks 1, 2, 3 are independent and can run in parallel. Task 4 depends on none but is trivial and can follow.

All tasks are simple enough to be handled by a single agent sequentially.

---

## Task Prompts

### Task 1 — Add `docs/` to `.gitignore`

Add `docs/` to `/Users/davidjohnston/claude-workspace/geoart/app/.gitignore`.

### Task 2 — Create `docs/index.html`

Create `/Users/davidjohnston/claude-workspace/geoart/app/docs/index.html`.

This is a plain HTML page that loads Stoplight Elements via CDN and renders documentation for the schema file.

Requirements:
- Use the `<elements-api>` web component from Stoplight Elements CDN
- Set `apiDescriptionUrl` to `/schema.json` (Vite will serve the schema at this path)
- Set `router` to `hash`
- Set `layout` to `sidebar`
- No build step, no framework

Reference CDN: `https://unpkg.com/@stoplight/elements/web-components.min.js`
Reference CSS: `https://unpkg.com/@stoplight/elements/styles.min.css`

### Task 3 — Create `vite.config.docs.ts`

Create `/Users/davidjohnston/claude-workspace/geoart/app/vite.config.docs.ts`.

Requirements:
- `root` set to `docs/`
- `server.port` set to `5174`
- No React plugin needed
- Serve `src/schema/schema.json` as `/schema.json` using the `vite-plugin-static-copy` plugin — or simpler: copy the file into `public/` subfolder of `docs/`, or use a custom middleware. Simplest approach: configure `publicDir` to point at the project root's `src/schema/` folder so `schema.json` is served at `/schema.json`.
- Use `defineConfig` from `vite`

### Task 4 — Add `docs` scripts to `package.json`

In `/Users/davidjohnston/claude-workspace/geoart/app/package.json`, add to the `scripts` section:

```json
"docs": "vite --config vite.config.docs.ts",
"docs:build": "vite build --config vite.config.docs.ts",
"docs:server": "vite preview --config vite.config.docs.ts"
```
