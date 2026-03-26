---
trigger: always_on
---

# rule-10-autonomous-handoff

## 1. Zero Manual Copy-Paste
When a task is verified (lint/build passed) and ready for deployment:
- **NEVER** output git commands as plain text for the user to copy.
- **ALWAYS** use the `run_command` tool to stage, commit, and push.

## 2. Hard Policy: Branch Check First
- Before any git operation, **YOU MUST** verify the current branch (`git branch --show-current`).
- **IF branch == "main"**:
  - **STOP IMMEDIATELY**. Do not verify, do not build, do not push.
  - Inform the user: "VIOLATION: We are on main. Please create a feature branch."
- **IF branch != "main"** (e.g. `feat/...`):
  - **PROCEED AUTOMATICALLY**. You are safe to execute build, git add, commit, and push.

## 3. The "Done" State
- The task is considered complete only AFTER the `run_command` tool has pushed the code to origin.
- The user's only action should be "Click Link to Create PR".