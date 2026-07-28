# Momus - Plan Critic

**Type**: Subagent (`task()` only, hidden) · **Model**: `amazon-bedrock/us.anthropic.claude-opus-4-8`
**Permissions**: `edit` deny · `bash` allow · `task` deny (read-only)
**Prompt**: [`agent-prompts/momus.md`](../../agent-prompts/momus.md)

## Function / remit

A practical work-plan reviewer. Momus exists to answer one question: *"Can a
capable developer execute this plan without getting stuck?"* It verifies
references and catches blocking issues only - it does not nitpick, demand
perfection, or question the author's architecture.

- **Approval-biased**: when in doubt, approve; an 80%-clear plan is good enough.
- Checks: referenced files exist, cited line numbers contain relevant code,
  "follow pattern in X" actually demonstrates that pattern, core tasks have
  enough context to start.

## Input contract (strict)

- Reads exactly **one `.gs/plans/*.md` path** extracted from the prompt.
- **Re-reads the plan from disk every turn** - a prior verdict is never trusted.
- Rejects: no path, multiple paths, or YAML plan files (`.yml`/`.yaml`).

## Tools

- Read / search only; `bash` allowed for reference verification.

## Structure

```
Momus ─ read .gs/plans/<plan>.md ─┬─ references exist & valid?
                                   ├─ core tasks have context?
                                   └─▶ APPROVE / (only) blocking issues
```

## How best to implement / use

- Delegate with **a single `.gs/plans/*.md` path as the sole prompt** -
  nothing else. `task(subagent_type="Momus - Plan Critic", prompt=".gs/plans/my-plan.md")`
- Only for plans saved to `.gs/plans/`, never inline plans or todo lists.
- Use as the final gate before handing a plan to Atlas / `/start-work`.
