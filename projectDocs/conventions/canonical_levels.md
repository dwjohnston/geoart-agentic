## Canonical Levels

Some files will have a `CANONICAL LEVEL` header at the top. This gives an indication of how seriously the code in that file should be treated.

Example:

```
/**
 * CANONICAL LEVEL: 🧪 - 2026-05-14
 */
```

The levels are:

👑 — Gold standard. Use this as a template for similar work and freely depend on the code, respecting regular module boundaries.

🥈 — Mostly good but with some questionable areas.

🗑️ — Intended to be replaced. Do not use as an example of how to do things.

🧪 — Experimental. Working when committed but may contain bugs or patterns that should not be repeated. If relying on this code, prompt the user for clarification before proceeding. Ask the user if they want you to add a matching canonical header to any file you write.

The canonical header also contains a `YYYY-MM-DD` date — a more recent 👑 header takes precedence over an older one.
