# Oracle - Architecture Consult

**Type**: Subagent (`task()` only, hidden) · **Model**: `amazon-bedrock/us.anthropic.claude-opus-4-8`
**Permissions**: `edit` deny · `bash` allow · `task` deny (read-only)
**Prompt**: [`agent-prompts/oracle.md`](../../agent-prompts/oracle.md)

## Function / remit

A read-only, high-IQ reasoning specialist invoked for complex analysis and
architectural decisions that need elevated reasoning. Consultation only - it
proposes, it never edits.

- Dissects codebases, formulates concrete implementable recommendations,
  maps refactoring roadmaps, and surfaces hidden issues.
- Pragmatic minimalism: biases to the simplest solution, reuses what exists,
  presents one primary recommendation, tags effort as Quick(<1h) / Short(1-4h)
  / Medium(1-2d) / Large(3d+).
- Terse by design: bottom line ≤3 sentences, action plan ≤7 steps.

## Tools

- Read / search only (`edit` denied); `bash` allowed for inspection.
- Supports follow-up questions via session continuation without re-establishing context.

## Structure

```
Oracle ─ read + reason ─┬─ Bottom line   (≤3 sentences)
                        ├─ Action plan   (≤7 steps, effort-tagged)
                        ├─ Why this approach
                        └─ Watch out for
```

## How best to implement / use

- Consult **before** implementing tricky architecture, **after 2+ failed fix
  attempts**, or for a post-implementation self-review.
- Give it full context - it's a standalone consult per invocation.
- **Wait for its result before finalizing** any decision it was asked to make;
  never ship an Oracle-dependent choice before its answer returns.
- Expensive - don't use it for simple lookups or first-attempt fixes.
