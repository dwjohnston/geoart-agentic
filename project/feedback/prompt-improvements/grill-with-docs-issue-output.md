# grill-with-docs — issue creation not mentioned as an output

**Session:** 2026-06-14 — node reference doc generation

## Problem

The user passed `Create a github issue` as part of their `grill-with-docs` invocation. The skill's `<what-to-do>` section describes grilling, CONTEXT.md updates, and ADRs — but says nothing about GitHub issues as a possible output artefact.

The skill handled it fine by inference, but it would be clearer if the skill explicitly acknowledged that the output of a grilling session can be a GitHub issue (not just CONTEXT.md / ADR updates).

## Suggested addition

In `<what-to-do>` or `<supporting-info>`, add:

> The output of a grilling session is not always a CONTEXT.md update or ADR. It may also be a GitHub issue, a feature brief, or simply a shared understanding. When the user's args specify an output type (e.g. "create a github issue"), produce that output after the grilling is complete.
