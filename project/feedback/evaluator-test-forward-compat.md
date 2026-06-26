# Why I looked in evaluator.test.ts

During `curve-modulator-wave-inputs`, adding five new input ports to the `curve-modulator-module` schema caused a type error in `evaluator.test.ts` (line 1248). The test contains an inline `implementModule` for `curve-modulator-module` with `defaultValues` typed against `NodeInputsResolved<"curve-modulator-module">`. The fix was adding the five new ports to that `defaultValues` object — no evaluator logic was touched.

**Suggested prompt addition for define-node/module-node skills:** "After changing a module's schema, search for inline `implementModule` uses of that module kind in test files outside `src/nodes/module` and update their `defaultValues` to include the new ports."
