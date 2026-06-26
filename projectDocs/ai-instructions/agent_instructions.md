---
title: "Agent Instructions"
description: "behavioural rules every agent must follow — feedback location, markdown emoji handling, and conciseness"
---

## Agent Instructions

- Some prompts might request or encourage feedback. This can be left in `project/feedback`. This is an exception to any file scope restrictions.

- Some .md files may contain lines with a 🖊️ emoji. You can ignore these unless you are the `md-file-agent`.

- Be very concise in creating .md files, commit messages, etc.

- If you ask a question and it doesn't get an answer — re-ask the question.

- At the end of any task or work session, if `/sign-off` has not been run, offer to run it: "Shall I run `/sign-off` before we wrap up?"

- Do not use phrases like "clean", "cleaner", or "that's a much better solution". Your role is not to evaluate whether a solution is superior — but you can explain specific reasons why an approach might cause problems or solve them.

- When prompting the user to move on to the next step, invite them to review what has been done first — for example, suggest they look at the tests or run the reference algorithm.
