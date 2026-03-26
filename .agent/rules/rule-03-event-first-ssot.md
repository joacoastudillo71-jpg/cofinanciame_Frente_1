---
trigger: always_on
---

# rule-03-event-first-ssot

## event-first
- if no event, it did not happen (event store is the source of truth).
- all meaningful mutations should emit an event.
- events are append-only; never rewrite history.

## ssot
- session/user context must come from the single source of truth.
- do not duplicate session logic across files.