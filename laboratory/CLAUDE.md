# Laboratory

## Terminology

- **experiment** — a named configuration with a set of variables. Running an experiment produces one run per permutation of those variables.
- **run** — a single permutation of an experiment's variables. Each run has its own output folder and produces N iterations.
- **iteration** — a single prompt/render cycle within a run. The first iteration uses the base prompt; subsequent iterations use the feedback prompt with the prior image.
- **variables** — the set of experiment inputs that are varied across runs (model, schema, basePrompt, feedbackPrompt, renderTicks, numIterations). Any variable can be a single value or an array; the experiment runs a cartesian product of all arrays.
