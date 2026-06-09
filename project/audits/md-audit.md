# Markdown Inconsistency Audit

Source of truth: `projectDocs/terminology.md`. Scope: root, `projectDocs/**`, `.claude/**`, `src/**/CLAUDE.md`. The `project/**` working notes were excluded by request.

Grouped by issue type. Each finding: file → problem → proposed fix.

---

## 1. Incorrect file paths / directory references

- **CLAUDE.md** (line ~202) — lists `typings.ts` under `schema/`. No `src/schema/typings.ts` exists. → Reference `src/schema/typeHelpers.ts` / `types.ts`.
- **projectDocs/FILE_STRUCTURE.md** (line ~47) — same nonexistent `typings.ts`. → `typeHelpers.ts`.
- **projectDocs/_index.md** — link `[Code Style](codeStyle.md)`; actual file is `code_style.md`. → `[Code Style](code_style.md)`.
- **CLAUDE.md** & **projectDocs/jobs_to_be_done/defining_a_new_node.md** — "Implement the node in `src/nodes/*/nodes*`" is an imprecise glob. → `src/nodes/[compute|control|render]/nodes/`.
- **.claude/agents/render-node-agent.md** — "You can only write in `src/render`"; path does not exist. → `src/nodes/render`.
- **.claude/agents/feature-agent.md** — "If this feature folder already exists in `src/projects/features`"; wrong path. → `project/features`.
- **.claude/agents/feature-agent.md** — File Scope says "Write in `project/staging` only" but no `project/staging` dir is described elsewhere; contradicts the file's own "you only write in - project". → Align File Scope to `project/` (+ `project/feedback`).
- **src/schema/CLAUDE.md** — "JSON Schema (draft-19)"; project CLAUDE.md and terminology say **draft-09**. → Change to draft-09.

## 2. Terminology misuse

- **projectDocs/node_anatomy.md** — heading "Part 1: Schema Declaration" and "Every node is **declared** in `schema.json`"; schema layer work is *define*. → "Schema Definition" / "defined".
- **projectDocs/algorithm_lifecycle.md** (👑 canonical) — "node types must be **declared** in `schema.json`", "**declared** in `value-kinds.schema.json`", "`schema.json` ← **declare** node & value types"; schema layer is *define*. → Replace with "defined" / "define".
- **projectDocs/node_anatomy.md** — uses `define*Node` / `defineComputeNode` / `defineRenderNode` / `defineControlNode` and `import { defineControlNode }`; runtime helper is `implement*Node`. → `implement{Compute,Render,Control}Node`.
- **projectDocs/adding_a_new_node_type.md** — "using the `define*Node` function". → `implement*Node`.
- **projectDocs/_index.md** — "Node Anatomy — schema declaration and `define*Node` runtime implementation". → "schema definition and `implement*Node` runtime implementation".
- **projectDocs/defining_an_algorithm.md** — title + filename use "Defining"; algorithms are *declared* (define is reserved for the schema layer). → "Declaring an Algorithm" / `declaring_an_algorithm.md` (and the matching `_index.md` link).
- **CLAUDE.md** — prose "Node inputs are defined in the schema under `params`" leans on the avoided term *param* in prose (referencing the literal schema key is fine, the prose is not). → Phrase as "node inputs".
- **.claude/agents/algorithm-agent.md** — "Implement new algorithms"; algorithms are *declared*. → "Declare new algorithms".
- **.claude/agents/graph-agent.md** — "converts a given graph into run time nodes" inverts the algorithm→graph relationship (a graph *is* the compiled output). → "converts a validated algorithm into a compiled graph".
- **.claude/agents/schema-agent.md** — "forward compatability of previous potential graphs"; should be *algorithms*. → "...of previous algorithms".
- **.claude/agents/feature-agent.md** — "for implmenting compute node defintions" etc. conflates implement with definition. → "for implementing compute/render/control nodes (from their schema definitions)".
- **src/schema/CLAUDE.md** — "serialised graphs", "graph structure", "between nodes in the graph", "param shapes", "new param" ×2; uses *graph* for uncompiled algorithms and *param* in prose. → "algorithm(s)" / "algorithm structure"; "node input(s)".

## 3. Spelling / typos

(British English required, except `color`/`center`.)

- **CLAUDE.md**, **projectDocs/conceptual_architecture.md**, **projectDocs/value_kinds.md** — "distingush" → "distinguish".
- **projectDocs/value_kinds.md** — "do no exist" (truncated sentence); schema key typo `waveTypjeValue` → `waveTypeValue`.
- **.claude/agents/{algorithm,compute-node,control-node,graph}-agent.md** — "## Responsbilities" → "Responsibilities".
- **.claude/agents/algorithm-agent.md** — "repeative" → "repetitive".
- **.claude/agents/schema-agent.md** — "compatability" → "compatibility".
- **.claude/agents/feature-agent.md** — "delgation"→"delegation", "implmenting"→"implementing", "defintions"→"definitions", "isnot"→"is not", "and  current changes" (missing verb, likely "and commit current changes").
- **.claude/agents/md-file-agent.md** — "may annotation .md files"→"may annotate", "improvments"→"improvements".
- **.claude/agents/{algorithm,compute-node,control-node,graph}-agent.md** — doubled "the the" ("You are the the … agent").
- **src/algorithms/CLAUDE.md** — "permenant" → "permanent".
- **src/schema/CLAUDE.md** — "primitves" → "primitives"; "the atomic value that represents" → plural agreement; truncated "Value References" section ("There") + empty `(example)` placeholder.
- **src/nodes/render/CLAUDE.md** — `.toMatchInlineSnapshots` → `.toMatchInlineSnapshot` (Vitest, singular).

## 4. Contradictions

- **projectDocs/sensible_defaults.md vs node_anatomy.md** — coordinate space stated as `-1..+1` (sensible_defaults) vs `0..1` (node_anatomy, and terminology.md's normalised 0..1). → Standardise on the terminology.md convention (0..1).
- **projectDocs/sensible_defaults.md vs defining_an_algorithm.md** — speed slider: `0.15` / min `-5` / max `5` vs `value 0.2` / min `-1` / max `1`. → Pick one canonical speed-slider range/default.
- **Layer-name vocabulary** — `paint`/`live` (defining_an_algorithm.md) vs `orbit`/`trail` (algorithm_lifecycle.md, node_anatomy.md) vs "live layer" (sensible_defaults.md). → Choose one vocabulary across docs.
- **Node registration mechanism** — `defining_an_algorithm.md`/`algorithm_lifecycle.md` describe adding to `GRAPHS` in `src/algorithms/index.ts`; CLAUDE.md/`defining_a_new_node.md` describe an auto-picked reference algorithm in `src/algorithms/reference/node_specific`. → Reconcile / cross-reference the two paths.
- **.claude phase numbering** — `feature-agent.md` defines Phases 1–4 but has two list items numbered `3.` ("Phase 3 – Execution", "Phase 4 – Acceptance"); `md-file-agent.md` references a non-existent "Phase 5"; `graph-agent.md` & `tooling-agent.md` carry identical generic "phase 2 / phase 3" boilerplate descriptions unrelated to their roles. → Renumber phases consistently; rewrite the two boilerplate `description:` fields; define or re-point Phase 5.
- **.claude/skills/dj-create-script/SKILL.md** — "comment at the top of the page describing what the **test** does" in a section about scripts. → "...what the **script** does".
- **src/schema/CLAUDE.md** — "draft-19" contradicts documented draft-09 (also in §1).

## 5. Other / notes

- **README.md** — generic Vite template boilerplate, no project-specific content (stale, no terminology/path error).
- **projectDocs/emoji.md** — documents only 🧽/💪; CLAUDE.md "Canonical Levels" uses 👑/🥈/🗑️/🧪 which emoji.md does not cover (incomplete, not contradictory).
- **src/** stub CLAUDE.md files — `src/application`, `src/common-tooling`, `src/graphEngine/graphEngine`, `src/nodes`, `src/nodes/compute`, `src/nodes/control` are empty. → Populate or remove.

---

## Highest-impact items

1. Pervasive `define*Node` → `implement*Node` mismatch (`node_anatomy.md`, `adding_a_new_node_type.md`, `_index.md`).
2. Schema-layer "declare" used where "define" is required — in the 👑-canonical `algorithm_lifecycle.md` and `node_anatomy.md`.
3. Nonexistent `src/schema/typings.ts` in two files; broken `codeStyle.md` link in `_index.md`.
4. `-1..+1` vs `0..1` coordinate-space contradiction.
5. `src/schema/CLAUDE.md` draft-19 vs draft-09 and *graph*/*param* prose misuse.
