# Task 03 — module-node: Implement rotate-module

Feature: rotate-node
Skill: module-node

## Prompt

Implement the `rotate-module` module node.

The module contains the `rotate` compute node. It exposes the same inputs as `rotate`:
- `inputPoints: colorPointArrayValueOrRef`
- `rotationCenters: colorPointArrayValueOrRef`
- `rotationAmount: numberValueOrRef`

And the same output:
- `points: colorPointArrayValue`

The module's `renderControl` renders a circle outline at each rotation center point.
