# document-modules observations (issue #139)

- All 9 module node types already had node-level `title`/`description` in
  `schema.json` before this task — the gap was per-param `description`
  fields (1/44 documented). The issue text ("should have a proper
  description/documentation") reads more naturally as node-level, which
  was already satisfied; the actual work was param-level.

- Issue said "8 currently" but `src/nodes/module/nodes/` has 9 files
  (`orbit-module.tsx` has no matching `.test.tsx`, which may be why it
  wasn't counted). Worth a headcount refresh if this issue is reused as a
  template for similar polish passes.

- While tracing `linker-module`'s `intervalTicks` param for its
  description, found it's declared in `timedLineArrayNodeImplementation`'s
  `defaults` (`src/nodes/render/nodes/timedLineArray.ts:110`) but never
  read inside `evaluate` — the interval counter advances once per render
  call regardless of this value. Documented it as "reserved; not
  currently consumed" rather than describing intended behaviour that
  isn't implemented. Flagging in case this is a genuine bug worth a
  follow-up issue rather than intentional.
