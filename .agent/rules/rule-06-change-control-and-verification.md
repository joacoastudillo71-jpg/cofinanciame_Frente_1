---
trigger: always_on
---

# rule-06-change-control-and-verification

## micro-steps
- max 3 files changed per step
- after each step: build + lint (or the repo scripts)

## definition-of-done
- no regressions in golden paths
- data isolation proof updated if relevant
- docs updated if architecture or safety policy changed