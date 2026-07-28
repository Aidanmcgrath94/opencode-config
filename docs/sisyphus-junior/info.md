# Sisyphus-Junior

**Type**: Subagent (`task()` only, hidden) · **Model**: `amazon-bedrock/us.anthropic.claude-sonnet-4-6`
**Permissions**: `task` denied except `Explore - Codebase Search` and `Librarian - Docs Search`
**Prompt**: [`agent-prompts/sisyphus-junior.md`](../../agent-prompts/sisyphus-junior.md)

## Function / remit

A focused code executor - the workhorse leaf node. Same discipline as
Sisyphus, but it implements directly and may **only** delegate research to
Explore/Librarian; it never spawns further executors. This keeps the
delegation tree shallow and prevents runaway recursion.

- **Todo obsession**: 2+ steps → `todowrite` first, one `in_progress` at a
  time, mark `completed` immediately, never batch.
- **Verification**: not done until LSP diagnostics are clean on changed files
  and the build passes.
- **Termination**: stops after the first successful verification (max 2 status
  checks) - no re-verifying.
- Honors the Anti-Duplication rule.

## Tools / subagents

- Full execution tools (read/write/edit, bash, LSP, skills).
- Delegation restricted to **Explore** and **Librarian** only.

## Structure

```
Sisyphus-Junior ─ todos ─┬─ Explore / Librarian  (research only)
                         └─ implement + verify (LSP clean, build passes)
                            └─ (cannot spawn other executors)
```

## How best to implement / use

- The executor Atlas (and Sisyphus) delegate implementation to. Not selected directly.
- Give it an **exhaustive 6-section prompt**: task, expected outcome, required
  tools, must-do, must-not-do, context.
- **Name any skills to load** in the prompt (e.g. `programming`, `frontend`) -
  skills are cheap to load, costly to omit.
- Keep each delegation atomic (one goal) and verify its output against your
  must-do / must-not-do list.
