# graph-description-display — implementation notes

## No plumbing needed — field already existed end to end

`GeoArtGraph.description` was already in the schema and already carried through
`GraphEntry`/`AlgorithmEntry` all the way to `AlgorithmPicker`. The whole feature was a
one-line JSX addition plus a test. Worth checking existing generated types/schema
before assuming new fields need adding.

## `schema.json` title/description labels look swapped

In `src/schema/schema/schema.json`, the `description` field's JSON-Schema `description`
text reads "Give you algorithm an enticing name!" — that instruction describes what
belongs in `title`, not `description`. `author`'s JSON-Schema `title` is also
"Description" (copy-paste from the field above it), not "Author". Didn't fix as
out-of-scope for this issue, but it will likely confuse the next person/agent filling in
a new reference graph's metadata.
