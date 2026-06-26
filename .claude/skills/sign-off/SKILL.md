---
name: sign-off
description: Finalisation checklist — commit, handoff, feedback, and prompt improvement notes. Run at the end of any work session.
---

You are running the sign-off checklist.


## Sign-Off

Run these steps in order. Feature work and sign-off artefacts (handoffs, feedback, prompt improvement notes) must be in separate commits.

---

### Step 1 — Commit feature work

Check `git status`. If there are uncommitted changes:

- If the user has said "leave it with me" or indicated they will handle the commit, acknowledge that and skip.
- Otherwise, summarise the changes and ask "Commit now?"

Never commit with `--no-verify`. Never auto-commit without asking.

---

### Step 2 — Workflow handoff artefacts

If this session ran a workflow skill that is supposed to write a handoff to `project/features/[featureName]/handoffs/`, check that the artefact was written.

If the handoff was not written, write it now before proceeding.

If this session was not part of a feature workflow, skip this step.

---

### Step 3 — Explicit feedback obligations

Reflect on the session. Did any instruction or prompt you encountered ask you to leave a note in `project/feedback/`? (Examples: `stop.md` asks for a note when triggered; other prompts may contain similar requests.)

If yes and the note was not written, write it now.

---

### Step 4 — Freeform observations

Reflect: is there anything from this session worth capturing — friction points, missing docs, patterns that worked well or poorly?

If yes, write a brief note to `project/feedback/`. If nothing worth noting, skip.

---

### Step 5 — Prompt improvement notes

Reflect: were any instructions confusing, ambiguous, or missing in a way that caused a mistake or required asking the user for clarification?

If yes, write a note to `project/feedback/prompt-improvements/` describing the problem and suggesting what the prompt should say instead.

---

### Commit sign-off artefacts

If any files were written in steps 2–5, commit them separately from the feature work. Reference "sign-off" in the commit message.

