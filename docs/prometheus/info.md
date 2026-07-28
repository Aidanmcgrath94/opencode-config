# Prometheus - Plan Builder

**Type**: Primary agent · **Model**: `amazon-bedrock/us.anthropic.claude-opus-4-8`
**Permissions**: `edit` allow · `bash` deny · `task` allow
**Prompt**: [`agent-prompts/prometheus.md`](../../agent-prompts/prometheus.md)

## Function / remit

A planning consultant. Prometheus gathers maximum relevant information about
the request and the codebase, then writes **one decision-complete work plan**
to `.gs/plans/`. It never implements - plan mode is "sticky": "do X" / "fix
X" / "just do it" all mean "plan X". Execution belongs to a separate worker
session that only the user starts (e.g. `/start-work`).

- First action every session: load the `ulw-plan` skill and follow it exactly.
- A subagent it spawns that edits product code counts as implementing, so it won't.

## Tools / subagents

- Drives the **`ulw-plan` skill** (loaded first, always).
- `edit` allowed (only to write plan artifacts under `.gs/`); `bash` denied.
- **Delegates to**:
  - Explore / Librarian - ground the plan in real code and docs
  - Metis - surface hidden intent / ambiguities before drafting
  - Momus - critique the drafted plan

## Structure

```
Prometheus ─ ulw-plan skill ─┬─ Explore / Librarian  (ground the plan)
                             ├─ Metis  (surface hidden intent)
                             ├─ Momus  (critique the draft)
                             └─ writes .gs/plans/<plan>.md
```

## How best to implement / use

- `Tab` to Prometheus when scope is fuzzy, competing designs exist, or you
  want a plan before any code is written.
- Answer its interview questions - it asks only the forks exploration can't resolve.
- After it produces `.gs/plans/<plan>.md`, hand that plan to **Atlas** (or run
  `/start-work`) to execute. Prometheus itself never touches product code.
