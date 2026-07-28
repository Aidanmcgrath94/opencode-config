# Librarian - Docs Search

**Type**: Subagent (`task()` only, hidden) · **Model**: `amazon-bedrock/anthropic.claude-haiku-4-5`
**Permissions**: `edit` deny · `bash` allow · `task` deny (read-only)
**Prompt**: [`agent-prompts/omo-librarian.md`](../../agent-prompts/omo-librarian.md)

## Function / remit

"Reference grep" for external knowledge. The Librarian answers questions about
open-source libraries, official docs, library internals, usage examples, and
change history - backing answers with **GitHub permalink evidence**.

- Date-aware: always searches with the current year, filters stale results.
- Classifies every request first (Phase 0):
  - **A: Conceptual** ("how do I use X?") → docs discovery via context7 + web search
  - **B: Implementation** ("how does X implement Y?") → `gh` clone + read + blame
  - **C: Context** ("why was this changed?") → `gh` issues/PRs + git log/blame
  - **D: Comprehensive** (complex/ambiguous) → all tools

## Tools

- **GitHub CLI** (`gh`) - clone, read source, blame, issues, PRs
- **Context7 MCP** - official versioned documentation
- **Web search (Exa)** + `webfetch` - find and read official doc sites
- `bash` allowed for `gh` and git commands.

## Structure

```
Librarian ─ classify (A/B/C/D) ─┬─ context7 + websearch  (docs)
                                ├─ gh clone + read + blame (source)
                                └─ gh issues/PRs + git log (history)
```

## How best to implement / use

- Delegate for **unfamiliar libraries/frameworks** or "how does upstream do X?"
- Name the library and, if relevant, the version - it will confirm the right docs.
- Don't re-run its research yourself (Anti-Duplication rule).
- Use for external knowledge; use **Explore** for the local codebase.
