# Note: touched src/graphEngine/compiler and src/graphEngine/graphEngine (issue #140)

Both directories carry a "STOP unless your task specifically relates to updating
the compiler/evaluator/graphEngine" header. Task: pull each render node's
visibility toggle into its owning module's control panel.

Why I ended up here: the module's `renderControl` is invoked from
`graphEngine.ts`'s `renderControlNodes()`, which is the only place that has
both (a) the compiled graph's render-node list and (b) the engine's live
`enabledRenderNodes` state. There is no way to surface a module's own render
toggles inside its `renderControl` without threading that data through from
here, so this genuinely was compiler/graphEngine work, not just an
application-layer change.

A prompt that would have gotten me here faster: "renderControl is invoked
from graphEngine.ts's renderControlNodes() — if you need to pass new
capabilities into a module's renderControl (not just param values), that's
the only place with access to the engine's actual render/eval state, and the
STOP header does not apply to additive changes here."

Bug found while doing this: naively deriving a module's id from its input
marker's nodeId via `nodeId.split(':')[0]` breaks for nested modules (a
module nested inside another, e.g. curve-modulator-module nesting
point-render-module) — it collapses down to the outermost ancestor's id.
Correct approach: strip only the trailing `:input-marker` suffix.
