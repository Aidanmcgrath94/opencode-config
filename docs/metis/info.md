# Metis - Plan Consultant

**Type**: Subagent (`task()` only, hidden) · **Model**: `amazon-bedrock/us.anthropic.claude-sonnet-4-6`
**Permissions**: `edit` deny · `bash` allow · `task` deny (read-only)
**Prompt**: [`agent-prompts/metis.md`](../../agent-prompts/metis.md)

## Function / remit

A pre-planning consultant. Metis analyzes a request to identify hidden
intentions, ambiguities, and likely AI failure points **before** a plan is
written. It analyzes, questions, and advises - it does not implement or modify
files. Its output feeds Prometheus (the planner), so it stays actionable.

- Read-only: analyzes and questions, never edits.
- Honors the Anti-Duplication rule: won't re-run a search it delegated.

## Tools / subagents

- Read / search only; `bash` allowed for inspection.
- May delegate discovery to Explore / Librarian (then won't duplicate that search).

## Structure

```
Metis ─ analyze request ─┬─ hidden intentions
                         ├─ ambiguities to resolve
                         ├─ AI failure points
                         └──▶ feeds Prometheus (planner)
```

## How best to implement / use

- Consult on **complex or ambiguous requests before planning** - its analysis
  sharpens Prometheus's plan and pre-empts predictable AI mistakes.
- Feed it the raw user request plus any relevant context.
- Use its output as an input to planning, not as a plan itself.
