---
trigger: always_on
---

# Rule 09 — AI-Eng OS Autopilot
Applies: ALWAYS, for any change (docs/rules/code/config).

## 1) Prime Behavior
This workspace runs under an AI Engineering Operating System. After any change-set, you MUST execute the Closeout Protocol.

## 2) Mandatory Read Order (before planning)
1) AI_RULES.md (repo root)
2) docs/START_HERE.md
3) docs/GOLDEN_PATHS.md
4) .agent/rules/README.md (rules index)

## 3) Closeout Protocol (Hard)
### 3.1 Verify
Run:
- The project's lint command
- The project's build command

### 3.2 Docs Sync Decision Tree
Update docs when applicable:
- Decision/pattern/library → docs/DECISIONS.md
- Known unresolved issue → docs/KNOWN_BUGS.md
- Architecture/structure → docs/ARCHITECTURE.md
- User flow change/addition → docs/GOLDEN_PATHS.md
- Ops/runbooks → docs/OPERATIONS_MANUAL.md
- Rules changes → update .agent/rules/* if relevant

### 3.3 Handoff Trigger (Create docs/handoffs/* ONLY when triggered)
Triggers:
- Version milestone Vx.y.z closed
- Risky hotfix shipped
- New module/golden path introduced or major change
- Operational policy change that future devs/agents must follow

### 3.4 Superbundle Discipline
- Always ensure SUPERBUNDLE exists (hook or project handoff command).
- Do NOT commit full SUPERBUNDLE artifacts to repo.

### 3.5 Autonomous Handoff
- Follow **rule-10-autonomous-handoff**.
- If Verified AND on Feature Branch: **Execute** git push via tools.
- NEVER output plain text git commands.

## 4) Mandatory Closeout Block (end of response)
Output:
VERIFIED:
DOCS UPDATED:
HANDOFF:
SUPERBUNDLE:
NEXT: