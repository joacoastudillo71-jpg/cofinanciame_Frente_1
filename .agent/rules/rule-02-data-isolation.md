---
trigger: always_on
---

# rule-02-data-isolation

## data-isolation
- every query and mutation must be scoped to the correct context.
- use the safe data access pattern defined in the project.
- never introduce cross-context reads/writes.

## anti-leak
- any feature that reads lists must have an anti-leak verification step.
- do not ship without validating isolation.