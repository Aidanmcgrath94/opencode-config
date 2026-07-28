# Nemesis - Security Reviewer

**Type**: Subagent (`task()` only, hidden) · **Model**: `amazon-bedrock/us.anthropic.claude-opus-4-8`
**Permissions**: `edit` deny · `bash` allow · `task` deny (read-only)
**Prompt**: [`agent-prompts/nemesis.md`](../../agent-prompts/nemesis.md)

## Function / remit

A read-only, one-shot **code security reviewer**. Nemesis audits a change for
security vulnerabilities and returns a structured **PASS/FAIL** verdict. It focuses
exclusively on security - it does NOT comment on style, architecture, or functionality
unless those directly create a security risk. It is the standalone, agent-level
counterpart to the security pass inside the `review-work` skill, and it is distinct
from **Momus** (who reviews *plans* for executability).

- Answers ONE question: *"Does this change introduce a security vulnerability?"*
- Evaluates against a 10-point checklist: input validation, auth/authz, secrets,
  data exposure, dependencies, cryptography, file/path, network, error leakage,
  supply chain.
- Every finding is grounded in the diff: file:line + attacker impact + remediation.

## Input contract (strict)

- Reviews **finished code** - a diff or an explicit set of changed files given in the
  prompt. It does **NOT** take a `.gs/plans/*.md` path (that is Momus's contract).
- **Re-reads the changed files / diff from disk each turn** - a prior verdict is never
  trusted without re-reading current content.
- One-shot leaf: does its own reading/inspection inline; never spawns sub-reviewers.

## Tools

- Read / search only; `bash` allowed for inspection (`git diff`, read files).
- `edit` and `task` denied.

## Structure

```
Nemesis ─ read diff/changed files ─┬─ 10-point security checklist
                                   ├─ ground each finding (file:line + impact + fix)
                                   └─▶ <verdict> PASS/FAIL + <severity> + <findings>
```

## How best to implement / use

- Delegate **after implementation** to security-audit a diff before it ships.
- Give it the changed files or `git diff` as the prompt (not a plan path).
- FAIL is returned on any CRITICAL/HIGH vulnerability (blocking); MEDIUM/LOW come back
  as non-blocking findings. Use it as the security gate; use **Momus** for plan review.
