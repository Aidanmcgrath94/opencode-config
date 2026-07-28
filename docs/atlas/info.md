# Atlas - Plan Executor

**Type**: Primary agent · **Model**: `amazon-bedrock/us.anthropic.claude-sonnet-4-6`
**Prompt**: [`agent-prompts/atlas.md`](../../agent-prompts/atlas.md)

## Function / remit

The master orchestrator for execution. Atlas completes **every** task in a
work plan via `task()`, parallel by default, and finishes with a Final
Verification Wave. It is a conductor, not a musician - it delegates,
coordinates, and verifies, but never writes code itself.

- Implementation tasks are the means; Final Wave approval is the goal.
- Auto-continues until all tasks are done and verified.
- Honors the Anti-Duplication rule: won't re-run a search it delegated.

## Tools / subagents

- Orchestrates entirely through `task()` (each call blocks until the subagent returns).
- **Delegates to**:
  - Sisyphus-Junior × N - parallel implementation
  - Explore / Librarian - research gaps
  - Oracle - consult on hard problems
- Runs its own verification (LSP diagnostics, build, tests) in the Final Wave.

## Structure

```
Atlas ─ work plan ─┬─ Sisyphus-Junior × N    (parallel implementation)
                   ├─ Explore / Librarian    (research gaps)
                   └─ Final Verification Wave (must pass = done)
```

## How best to implement / use

- `Tab` to Atlas after Prometheus produces a plan, or when you already have a
  todo list to grind through end-to-end.
- Give it a plan path or a concrete todo list; it fans work out in parallel.
- Trust it to auto-continue - it won't stop until the Final Verification Wave
  passes. Don't use it for open-ended exploration; it wants defined tasks.
