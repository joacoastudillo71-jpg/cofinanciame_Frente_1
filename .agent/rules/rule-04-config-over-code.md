---
trigger: always_on
---

# rule-04-config-over-code

## config-over-code
- no hardcoded entity logic (no "if entityX", no "if userY").
- behavior switches via settings/config.
- navigation must respect enabled modules.

## naming
- ui labels can be config-specific, but domain model remains stable.