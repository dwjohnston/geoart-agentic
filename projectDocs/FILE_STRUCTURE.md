# Project File Structure

## Root Level

### `/project/`
Project management and feature tracking.

- **`features/`** — Feature development directories
  - `[featureName]/` — Individual feature folders
    - `FEATURE_BRIEF.md` — High-level feature overview and requirements
    - `FEATURE_PLAN.md` — Implementation plan and technical details
- **`feedback/`** — User feedback, suggestions, and notes

### `/projectDocs/`
Project documentation and architectural guides.

- **`_index.md`** — Main documentation index and entry point

### `/src/`
Source code for the application.

- **`algorithms/`** — Schema-compliant algorithm declarations
  
- **`application/`** — Main React application entry point
  
- **`common-tooling/`** — General-purpose, non-domain-specific utilities and helpers
  
- **`graphEngine/`** — Graph processing and evaluation system
  - `graphEngine/` — Core graph implementation
  - `compiler/` — Validates and compiles graph definitions into executable form
  - `evaluator/` — Evaluates and executes compiled graphs
  - `externalInterfaces/` — Glue interfaces between `compiler` `evaluator` and `nodes/*`
  
- **`nodes/`** — Node type implementations
  - `compute/`
    - `nodes/` — Computational/processing nodes
  - `render/`
    - `nodes/` — Rendering and visualization nodes
  - `control/`
    - `nodes/` — Control flow and logic nodes
  
- **`schema/`** — Schema definitions and validation
  - `schema/` — Schema definition files
    - `schema.json` — Main schema definition
    - `value-kinds.schema.json` — Value type schema
    - `refable-value-kinds.schema.json` — Referenceable value types schema
  - `typeHelpers.ts` - Helper typings
  
- **`ui-tooling/`** — UI component utilities and helpers
