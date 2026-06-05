# projectDocs authoring guide

`projectDocs/` is a shared fragment pool. Fragments are composed into skill files, agent files, and CLAUDE.md files via `<!-- include: projectDocs/... -->` directives.

## Keep skill files thin

Skill SKILL.md files should contain only the frontmatter, role line, file scope, and responsibilities. All instructional content — domain knowledge, handoff instructions, test conventions — belongs in a fragment here and pulled in with an include.

**Wrong** — instructions inline in the SKILL.md:

```md
## Handoff
When complete, write to project/features/[featureName]/handoffs/...
```

**Right** — fragment in projectDocs, included by the SKILL.md:

```md
<!-- include: projectDocs/compute_node_skill.md -->
```

## Fragment naming

Name fragments after what they describe, not where they are used:

- `compute_node_skill.md` — tests and handoff instructions for the compute-node skill
- `node_anatomy.md` — how nodes are structured
- `declaring_an_algorithm.md` — how to write an algorithm declaration

A fragment used by multiple skills is still one file.

## Generating output files

Run `bun generate-agent-files <approach>` to compose templates into output files. Outputs are gitignored. See [agent_prompt_experiments.md](agent_prompt_experiments.md) for the full approach inventory.
