# Task 02 — compute-node: Implement rotate compute node

Feature: rotate-node
Skill: compute-node

## Context

Read the handoff at `project/features/rotate-node/handoffs/define-rotate.md` for schema details.

Read the feature brief at `project/features/rotate-node/FEATURE_BRIEF.md` for test cases and behaviour.

## Prompt

Implement the `rotate` compute node.

**Behaviour:** Product cardinality — each input point is rotated about every rotation centre. Output length = `inputPoints.length × rotationCentres.length`. Output colour is taken from `inputPoints`.

`rotationAmount` is 0–1 where 1.0 = full 360° (2π radians).

**Test cases:**

| Inputs | Expected output |
|---|---|
| `inputPoints: [(1,0,red)]`, `rotationCentres: [(0,0,white)]`, `rotationAmount: 0` | `[(1, 0, red)]` — identity |
| `inputPoints: [(1,0,red)]`, `rotationCentres: [(0,0,white)]`, `rotationAmount: 0.25` | `[(0, 1, red)]` — 90° CCW about origin |
| `inputPoints: [(1,0,red), (0,1,blue)]`, `rotationCentres: [(0,0,white), (0.5,0,white)]`, `rotationAmount: 0.25` | `[(0,1,red), (-1,0,blue), (0.5,0.5,red), (-0.5,-0.5,blue)]` — 4 outputs |
