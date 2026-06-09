---
title: "Define Node Skill"
description: "handoff format for schema definition tasks"
---

## Handoff

When the schema definition is complete and `bun generate` has run successfully, write a handoff file to `project/features/[featureName]/handoffs/define-node.md`.

The handoff must contain:

**1. Node summary** — kind, type name, and a one-line description of what it does.

**2. Input ports** — each port's name and value type.

**3. Output ports** — each port's name and value type.

**4. Behaviour spec** — a concise description of what the node computes, copied or summarised from the feature brief. This is the primary reference for the implementation skill.

Example:

```md
# define-node handoff: multiply

**Kind:** compute
**Type:** `multiply`
**Description:** Multiplies two numbers.

## Inputs
| Port | Type |
|---|---|
| `a` | `numberValueOrRef` |
| `b` | `numberValueOrRef` |

## Outputs
| Port | Type |
|---|---|
| `product` | `numberValue` |

## Behaviour
Returns `product = a × b`.
```
