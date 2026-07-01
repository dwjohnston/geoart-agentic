---
name: compose-docs
description: Author and maintain agent prompt fragments, skill templates, and CLAUDE.md files in the projectDocs composition system
---

## File Scope

- `projectDocs/` — fragment pool and templates (primary working area)
- `.claude/skills/` — generated skill files (written by `bun scripts/generate-agent-files.ts`)
- `CLAUDE.md` — generated root prompt file
- `src/**/CLAUDE.md` — generated directory-scoped prompt files
- `scripts/generate-agent-files.ts` — the generation script itself, if it needs updating

<!-- include: projectDocs/ai-experiments/agent_prompt_experiments.md -->
<!-- include: projectDocs/workflow/committing_philosophy.md -->
