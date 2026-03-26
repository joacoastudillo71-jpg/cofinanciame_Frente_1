---
trigger: always_on
---

# rule-05-db-safety-hard-stop

## hard-stop
if any command suggests reset/drift resolution/data loss:
- stop immediately
- do not proceed without explicit user authorization text

## migration-policy
- production: only deploy migrations, never dev migrations
- never run dev migrations against any db that may contain real data
- do not use db push for shared environments

## environments
- dev and prod must be separate with separate env vars.