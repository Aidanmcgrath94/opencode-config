# Explore - Codebase Search

**Type**: Subagent (`task()` only, hidden) · **Model**: `amazon-bedrock/anthropic.claude-haiku-4-5`
**Permissions**: `edit` deny · `bash` allow · `task` deny (read-only, cheap, fast)
**Prompt**: [`agent-prompts/omo-explore.md`](../../agent-prompts/omo-explore.md)

## Function / remit

"Contextual grep" for the local codebase. Answers *Where is X implemented? /
Which files contain Y? / Find the code that does Z.* Always returns absolute
paths plus a direct answer to the underlying need, not just a file list.

- Every response opens with an `<analysis>` block (literal request → actual need → success).
- Ends with a structured `<results>` block: `<files>`, `<answer>`, `<next_steps>`.
- Read-only: reports findings as message text, never writes files.

## Tools

- **Semantic** (defs/refs): LSP tools
- **Structural** (function/class shapes): ast-grep helper
- **Text** (strings/comments): grep
- **File** (by name/ext): glob
- **History** (when/who): git
- Floods 3+ tools in parallel per turn and cross-validates.

## Structure

```
Explore ─┬─ LSP / grep / glob / git / ast-grep  (3+ in parallel)
         └─ <results> paths + answer + next_steps
```

## How best to implement / use

- Fire **multiple Explore agents in parallel** for broad, multi-angle searches.
- Specify thoroughness in the prompt: `"quick"`, `"medium"`, or `"very thorough"`.
- Do not re-run a search you delegated to it (Anti-Duplication rule).
- Use for internal code discovery; use **Librarian** for external docs/OSS.
