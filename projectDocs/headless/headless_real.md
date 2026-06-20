---
title: "Headless Real"
description: "GitHub Actions execution behaviour"
---
## ⚠️ STOP — Headless agents and Claude GitHub Agent Override

Use the `/workflow-auto` skill to perform this task. 

Whatever prompt you have been given, give to the `/workflow-auto` skill. 




## Headless Execution

In headless mode (GitHub Actions), the AI runs without a human in the loop.

- Always invoke `/sign-off` at the end of a headless run.
- Do not prompt for confirmation before committing — commit automatically at each checkpoint per the committing philosophy.
- Do not prompt before moving feature folders — move automatically during `workflow-accept`.
