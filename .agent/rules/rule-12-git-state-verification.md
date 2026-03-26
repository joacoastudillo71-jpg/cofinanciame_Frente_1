---
trigger: always_on
---

# rule-12-git-state-verification
## git-state-verification (HARD RULE)
Before making ANY claim about:
- PR status (open/merged/closed)
- Branch state
- What has been pushed or not
- Remote repository state
You MUST first run:
git fetch origin && git status
## prevention
- NEVER trust local git state for remote claims
- ALWAYS fetch before making assertions about GitHub/remote
- If unsure, say "let me verify" and run the fetch command