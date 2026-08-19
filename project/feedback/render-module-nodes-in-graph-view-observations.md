# render-module-nodes-in-graph-view: observations

## Hidden non-breaking space broke exact-match edits

`src/application/GraphView.tsx`'s column-title fallback (`i === 0 ? 'Compute' : ' '`) uses a
U+00A0 non-breaking space, not a regular space, inside the string literal. It's visually
indistinguishable from a normal space in an editor or in tool output. String-replace edits using
a plain space in the pattern silently fail to match (0 occurrences) with no hint as to why —
confirmed via `xxd` that the byte was `c2a0`. Worked around by generating the replacement string
programmatically in Python (`chr(0xa0)`) rather than typing the character directly, since typed
NBSP characters in a tool call also risk silent normalisation to a regular space.

Not a bug in the source — likely deliberate (a nbsp keeps the empty title cell's line-height
consistent) — but worth flagging for anyone else editing that fallback string, and as a reminder
that a failed exact-match edit against a short, simple-looking string is a signal to check for
non-ASCII whitespace before assuming the match logic itself is broken.

## No node-lifecycle skill applied to this task

Confirmed the same gap already logged in
`project/feedback/prompt-improvements/no-skill-covers-general-infra-work.md`: this task was pure
`src/application` UI work (GraphView layout/rendering) with no schema or node-type change, so
none of `define-node`/`compute-node`/`render-node`/`control-node`/`module-node`/`algorithm`
applied. Ran headlessly, so rather than stopping to ask (as that prior note describes for HITL),
proceeded by executing the task directly and recording the reasoning in `FEATURE_PLAN.md`. This
worked fine but reinforces that a documented default for "no skill applies" would remove the
need to improvise this each time.
