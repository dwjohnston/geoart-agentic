# Code Terminology Audit

Source of truth: `projectDocs/terminology.md` + `projectDocs/algorithm_lifecycle.md` (both 👑 canonical). Scope: `src/**` excluding `src/algorithms/**`.

Findings are split by **risk** first (Part A = cosmetic, safe to change in place; Part B = structural, a breaking rename or a decision), then by issue type. Counts/locations are indicative — grep before acting.

Canonical rules being checked:
- **define / declare / implement / resolve** discipline — *define* = schema layer, *declare* = algorithm layer, *implement* = code/runtime layer, *resolve* = runtime values.
- **graph vs algorithm** — an *algorithm* is the authored, validated data structure; a *graph* is only what it becomes *after* `compile()`.
- Avoided terms: `type` (use *kind* for "the kind of thing"), `param` (use *node input* in prose), `width` for line thickness (use *thickness*).
- Same concept named consistently across files.

---

## Part A — Cosmetic (safe to change in place)

These are comments, doc-comments, test names, error strings and British-English spelling. No public API changes.

### A1. define/declare/implement misuse in comments

- `src/schema/typeHelpers.ts:38` — comment "the evaluate function returns this shape — **defineComputeNode** reconstructs the full Value". The runtime helper is `implementComputeNode`. → "implementComputeNode reconstructs…".

### A2. graph vs algorithm in comments / test names / error strings

The compiler's *input* is a validated **algorithm**; it only becomes a **graph** after `compile()`. These all describe the pre-compile artefact as a "graph":

- `src/graphEngine/compiler/compiler.ts:38` — `/** Static params from the serialised graph … */` → "…from the algorithm".
- `src/schema/validateGeoArtGraph.ts:19` — doc-comment "Validate a serialized GeoArt **graph**". This validates the authored algorithm. → "Validate a serialised GeoArt **algorithm**".
- `src/schema/earthVenus.test.ts:6,91` — test names `"valid graph"` / `"invalid graph"` validate algorithms. → `"valid algorithm"` / `"invalid algorithm"`.
- `src/graphEngine/compiler/validators/validators.test.ts:300` — `'valid graph with no enum ports …'` → "valid algorithm…".
- `src/graphEngine/evaluator/evaluator.ts:190` — `@param t - Tick count since graph start` is acceptable (the evaluator genuinely operates on a compiled graph); left as-is, noted for completeness.

### A3. `param` used in prose comments (the literal schema key is fine)

Referencing the `params` JSON key in code is correct; using "param" as the *concept* in prose should be "node input" (terminology.md → "param … already well covered by 'node input'").

- `src/graphEngine/compiler/compiler.ts:38` — "Static **params** … keyed by **param** name" → "Static node inputs … keyed by input name".
- Sweep the doc-comments in `graphEngine/compiler/**`, `graphEngine/evaluator/evaluator.ts`, `nodes/*/implement*Node.ts` for prose "param"; ~600 `param` hits exist but the large majority are the literal `params` key/identifier and must NOT be changed.

### A4. Spelling — British English required (except `color`, `center`)

- "serialized" vs "serialised" is mixed (≈4 British / 2 American). Standardise on **serialised** — fix `src/schema/validateGeoArtGraph.ts:19` ("serialized").
- "Normalize"/"normalized" appears alongside "Normalise"/"normalised" (≈8 British / 2 American). Standardise on **normalise/normalised**.
- One "initialize" → **initialise**.
- `DefineableComputeNodeKind` (`src/nodes/compute/implementComputeNode.ts:8`) is also a **misspelling** — correct English is "Definable" (no medial *e*). See B4 for the terminology problem with the same identifier.

---

## Part B — Structural (breaking rename or a decision needed)

These touch exported symbols, type names, schema keys or filenames. Each needs a deliberate rename + call-site sweep, or a decision where canonical docs conflict.

### B1. Node *implementations* exported as `…NodeDef` ("Def" = define = schema layer)

Every node implementation (code layer) is exported with a `…NodeDef` name, except one. "Def"/"Definition" is schema-layer vocabulary; these are `implement*Node(...)` results — implementations.

Affected exports (each imported by its layer registry, so renames ripple into `registry.ts` + tests):
- compute: `timeNodeDef`, `orbitNodeDef`, `colorPointNodeDef`, `waveNodeDef`, `pointsOnALineNodeDef`, `multiplierNodeDef`, `curveModulatorNodeDef` — and the lone correct outlier `addNodeImplementation` (`nodes/compute/nodes/add.node.ts:10`).
- render: `timedLineNodeDef`, `timedLineArrayNodeDef`, `circleNodeDef`, `connectDotsNodeDef`, `polygonNodeDef`, `linesThroughPointNodeDef`.
- control: `sliderNodeDef`, `colorPickerNodeDef`, `dropdownNodeDef`, `lfoControlNodeDef`.

→ Pick one convention and apply uniformly. `…NodeImplementation` (matches `add` and the `implement*Node` helper) is the terminology-correct choice; `addNodeImplementation` should not be the only one following it.

### B2. `externalInterfaces/*NodeDefinition.ts` — files & types name the *implementation contract* "Definition"

The shape returned by `implement*Node` is the node's runtime contract (code layer), but it is modelled as "Definition":

- Files: `ComputeNodeDefinition.ts`, `ControlNodeDefinition.ts`, `RenderNodeDefinition.ts`, `AllNodeDefinitions.ts`.
- Types: `ComputeNodeDef`/`LegacyComputeNodeDef`, `ControlNodeDef`/`LegacyControlNodeDef`, `RenderNodeDef`/`LegacyRenderNodeDef`.
- Function: `convertComputeNodeDefinitionToLegacyDefinition` (`nodes/compute/implementComputeNode.ts:62`) and siblings `convertRenderNodeDefToLegacy`, `convertControlNodeDefToLegacy`.

→ Rename to *NodeImplementation* / `…NodeImpl` consistently (filenames + types + the `convert*` helpers + all registry call sites).

### B3. `GeoArtGraph` type names the *uncompiled algorithm* a "graph" — DECISION REQUIRED

The authored, validated data structure is canonically an **algorithm**; "graph" is reserved for the compiled output (terminology.md → *graph*). But the core type is `GeoArtGraph`, threaded everywhere as the pre-compile artefact: `graphEngine.load(graph: GeoArtGraph)`, all compiler validators (`_helpers.ts` etc.), `validateGeoArtGraph.ts`.

Conflict: `algorithm_lifecycle.md` (👑) explicitly states "It is a plain data structure of type `GeoArtGraph`" — so a canonical doc currently *endorses* this name while terminology.md's concept definitions contradict it. This is the single highest-leverage naming decision and cannot be auto-fixed.

→ Decide: (a) rename `GeoArtGraph` → `GeoArtAlgorithm` (+ generated `schema-types`, `validateGeoArtGraph.ts`, lifecycle doc), or (b) explicitly carve out `GeoArtGraph` as a sanctioned exception in terminology.md. Recommend (a).

### B4. `DefineableComputeNodeKind` — "Defineable" applied to the *implement* helper

`src/nodes/compute/implementComputeNode.ts:8` — `type DefineableComputeNodeKind = ComputeNodeKinds;`, consumed by `implementComputeNodeLegacy`. Mixes *define* vocabulary into the implementation helper (and is misspelled, see A4). It is a bare alias of `ComputeNodeKinds`. → Remove the alias and use `ComputeNodeKinds` directly, or rename to `ComputeNodeKind`.

### B5. Schema node input `lineWidth` — *width* used for line thickness

`src/schema/schema/schema.json:963` (connect-dots node definition):
```json
"lineWidth": { "description": "Width of each line segment in pixels", ... }
```
terminology.md → "If talking about the thickness of a line, use **thickness** instead." This is a schema-layer (define) violation, so it propagates to generated types, the node implementation (`nodes/render/nodes/connectDots.node.ts` reads `inputs.lineWidth`) and any algorithm declaring it.

→ Rename the node input to `thickness` (or `lineThickness`), update the description ("Thickness of each line segment in pixels"), regenerate types, update `connectDots.node.ts` and declaring algorithms. (Browser-API `canvas.lineWidth = …` is the Canvas2D property and must stay as-is.)

### B6. `.node.ts` filename convention is inconsistent — naming consistency

Node implementation files mix two conventions, and split pure-math helpers out under a bare name:
- With suffix: `orbit.node.ts`, `wave.node.ts`, `time.node.ts`, `pointsOnALine.node.ts`, `circle.node.ts`, `polygon.node.ts`, `connectDots.node.ts`, `timedLine.node.ts`, `timedLineArray.node.ts`.
- Without suffix: `linesThroughPoint.ts` (a render node, peers all use `.node.ts`).
- Helper files reuse the bare name: `orbit.ts`, `wave.ts`, `time.ts`, `pointsOnALine.ts` ("Pure math for the X node") sit next to `X.node.ts`.

→ Standardise: node implementations `*.node.ts` (rename `linesThroughPoint.ts` → `linesThroughPoint.node.ts`); give pure-math helpers a distinct, non-colliding suffix (e.g. `orbit.math.ts`).

### B7. Test fixtures name uncompiled algorithms "Graph" — naming consistency

`graphEngine/graphEngine/_testGraphs/` dir + `testGraph.ts`, `pointsOnALine{,2}.ts`, and exports `testGraph`, `wavingLinesGraph`, `pointsOnALineTestGraph` typed `GeoArtGraph` are all *algorithms* (pre-compile). Also `allReferenceGraphs.snapshot.test.ts`, `renderSnapshotToFile.ts` use "graph" for the authored artefact. Resolution is coupled to B3 — rename together once B3 is decided.

---

## Highest-impact items

1. **B3** — `GeoArtGraph` vs the *algorithm* concept. Pervasive, and a canonical-doc conflict; decide before any "graph→algorithm" sweep so B7/A2 follow consistently.
2. **B1 + B2** — `…NodeDef` / `*NodeDefinition` for code-layer *implementations*. Largest mechanical rename; `addNodeImplementation` already shows the target.
3. **B5** — schema input `lineWidth` → `thickness`; schema-layer so it propagates through generated types + impl + algorithms.
4. **A2/A3** — comment/test/string "graph"/"param" misuse; safe, do alongside the B-renames so docs and code converge.
5. **A4 + B4/B6** — British-English drift and inconsistent `.node.ts` / `Defineable` naming.
