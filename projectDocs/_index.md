# Project Docs

## Ai Experiments

- [Agent Prompt Experiments](ai-experiments/agent_prompt_experiments.md) — composition system reference — only needed when working on prompt authoring or approach experiments

## Ai Instructions

- [Agent Instructions](ai-instructions/agent_instructions.md) — behavioural rules every agent must follow — feedback location, markdown emoji handling, and conciseness

## Architecture

- [File Structure](architecture/FILE_STRUCTURE.md) — project file structure reference
- [Algorithm Lifecycle](architecture/algorithm_lifecycle.md) — from schema definition to pixels on screen
- [Conceptual Architecture](architecture/conceptual_architecture.md) — nodes, layers, the schema, and how refs connect them
- [Terminology](architecture/terminology.md) — canonical definitions of define, declare, implement, and resolve

## Conventions

- [Canonical Levels](conventions/canonical_levels.md) — 👑 / 🥈 / 🗑️ / 🧪 quality indicators with dates
- [Code Style](conventions/code_style.md) — ES modules, no enums, assertion style
- [Emoji](conventions/emoji.md) — 🧽 (cleanup) and 💪 (good pattern, more could be added) — emoji used in code comments
- [Language](conventions/language.md) — British English rules and exceptions
- [Tooling](conventions/tooling.md) — bun commands for test, typecheck, validate, and generate

## Headless

- [Headless Real](headless/headless_real.md) — stub — real GitHub Actions execution behaviour (content not yet written)
- [Headless Test](headless/headless_test.md) — STOP instruction — included in test builds to halt headless agents and verify skill invocation

## Node Development

- [Adding a New Node Type](node-development/adding_a_new_node_type.md) — step-by-step guide for control, compute, render, and module nodes
- [Compute Node Patterns](node-development/compute_node_patterns.md) — taxonomy of compute node categories and algorithm composition patterns
- [Declaring an Algorithm](node-development/declaring_an_algorithm.md) — wiring nodes into a GeoArtGraph, registering it, and sensible defaults for coords, colours, timing, and port values
- [Node Anatomy](node-development/node_anatomy.md) — schema definition and implement*Node runtime implementation for all node kinds
- [Node Implementation Guidelines](node-development/node_implementation_guidelines.md) — file structure, export format, and testing patterns
- [Schema Guidelines](node-development/schema_guidelines.md) — value primitives, array values, enum values, module nodes, and testing
- [Type Helper Authoring](node-development/type_helper_authoring.md) — how to write TypeScript type helpers
- [Value Kinds](node-development/value_kinds.md) — value primitives, array values, enum values, and common mistakes

## Skill Fragments

- [Compute Node Skill](skill-fragments/compute_node_skill.md) — tests and handoff format for compute node implementations
- [Control Node Skill](skill-fragments/control_node_skill.md) — tests and handoff format for control node implementations
- [Define Node Skill](skill-fragments/define_node_skill.md) — handoff format for schema definition tasks
- [Module Node Skill](skill-fragments/module_node_skill.md) — tests and handoff format for module node implementations
- [Render Node Skill](skill-fragments/render_node_skill.md) — tests and handoff format for render node implementations
- [Skill Feature Name](skill-fragments/skill_feature_name.md) — how a skill determines the current feature name
- [Skill Input Handoff](skill-fragments/skill_input_handoff.md) — pattern for reading a handoff from a prior skill
- [Skill Test](skill-fragments/skill_test.md) — skill invocation test fragment — writes a hillbilly poem; only used when testing the skill machinery

## Tooling

- [Scripts Authoring](tooling/scripts_authoring.md) — how to author generation scripts

## Workflow

- [Committing Philosophy](workflow/committing_philosophy.md) — when to commit and at what granularity
- [Skills Index](workflow/skills_index.md) — available workflow and node development skills
- [Subagents Index](workflow/subagents_index.md) — available workflow and node development subagents
- [Workflow](workflow/workflow.md) — feature ideation, planning, execution, and acceptance phases
- [Workflow Feature Skill](workflow/workflow_feature_skill.md) — Phase 1 skill constraints — conversational ideation only, no file exploration, outputs FEATURE_BRIEF.md
- [Workflow Subagents](workflow/workflow_subagents.md) — four-phase workflow for the subagents approach, covering HITL and headless modes

## Root Files

- [Agent Prompt Composition](CLAUDE.md) — composition system authority — philosophy, terminology, and approach experiments; only needed when working on prompt authoring
