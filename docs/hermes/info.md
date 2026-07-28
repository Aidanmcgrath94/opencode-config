# Hermes - PR & GitHub Delivery

**Type**: Subagent (`task()` only, hidden) · **Model**: `amazon-bedrock/us.anthropic.claude-sonnet-4-6`
**Permissions**: `edit` deny · `bash` allow · `task` deny (read-only to filesystem; writes to GitHub via gh/MCP)
**Prompt**: [`agent-prompts/hermes.md`](../../agent-prompts/hermes.md)

## Function / remit

A delivery agent that owns the **pull-request lifecycle** and GitHub operations.
Hermes carries finished, committed work to GitHub - it creates, updates, and merges
PRs and drives repo/issue/PR operations via the `github` MCP. It is read-only to the
filesystem; its writes go to GitHub, not to local files.

- Starts **after commits exist** - it defers all local git plumbing (stage, commit,
  rebase, squash, reset, force-push, history investigation) to the **`git-master`** skill.
- Owns `gh pr create` / `gh pr edit` / `gh pr checks` / `gh pr view` / `gh pr merge`
  and the `github_*` MCP tools (toolsets: repos, issues, pull_requests).
- Operates **only from the task-owned worktree**, after review/verification gates -
  never PR create/review/merge in the main worktree.

## Tools

- `github` MCP (`github_*` tools) + the `gh` CLI; `bash` allowed for `gh`/git-read.
- `edit` and `task` denied - never edits code, never spawns subagents.
- **Token**: needs `GITHUB_PERSONAL_ACCESS_TOKEN` (a **classic PAT with `repo` scope**)
  exported in the environment; the `github` MCP uses `oauth: false` so a missing PAT
  fails cleanly instead of prompting an OAuth flow. The token value is never printed,
  logged, or committed. (A local-Docker `ghcr.io/github/github-mcp-server` alternative
  exists; the remote hosted endpoint is used here.)

## Structure

```
Hermes ─ (commits already exist) ─┬─ gh pr create / edit / checks
                                  ├─ github_* MCP (repos/issues/PRs)
                                  └─ gh pr merge (after gates) ──▶ GitHub
   defers local git ──▶ git-master skill
```

## How best to implement / use

- Delegate **after commits exist** to open, update, or merge a PR.
- Ensure `GITHUB_PERSONAL_ACCESS_TOKEN` (classic PAT, `repo` scope) is set and OpenCode
  restarted so the `github` MCP resolves.
- Local commits/rebases/history stay with **git-master**; Hermes only handles the
  GitHub/PR side, from the task worktree.
