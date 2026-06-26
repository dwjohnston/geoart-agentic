# Prompt improvement: American English exceptions not reinforced in node skills

**Session:** rotate-node, 2026-06-14

## Problem

The `define-node` skill wrote a port named `rotationCentres` (British English). The CLAUDE.md lists `center` as an American English exception, but the node skill prompts don't repeat this reminder. The agent defaulted to British English for the port name.

## Suggested fix

Add a note to `define-node`, `compute-node`, `module-node`, and `algorithm` skill prompts:

> **Language note:** Port names and identifiers follow American English for the exceptions listed in CLAUDE.md: use `center` (not `centre`) and `color` (not `colour`).
