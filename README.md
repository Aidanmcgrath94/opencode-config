# GoonSquad

A personal, standalone re-implementation of the useful parts of
[`oh-my-openagent`](https://github.com/code-yeongyu/oh-my-openagent) for
[OpenCode](https://opencode.ai), extracted so it runs with **zero dependency
on the actual plugin package** - no `bunx`, no auto-updating third-party
code loaded into every session, just plain OpenCode native primitives
(agents, skills, commands, MCP config, and a handful of small local plugin
hooks) that I own and can read/edit/maintain directly.

## Why this exists

`oh-my-openagent` is a great, actively maintained project, but installing it
as a plugin means third-party code runs automatically on every OpenCode
session, indefinitely, and gets silently updated (`oh-my-openagent@latest`).
This repo is a frozen, personal snapshot of the parts that were worth
keeping, adapted to run without the plugin at all.

**License note**: `oh-my-openagent` is distributed under the Sustainable Use
License (SUL-1.0), which explicitly permits copying, adapting, and using
derivative works for personal, non-commercial use. This repo is exactly
that - a personal derivative, not for resale or redistribution. Original
project: <https://github.com/code-yeongyu/oh-my-openagent>.

## What's in here

| Dir/file | What |
|---|---|
| `opencode.jsonc` | Agent registrations (inline, via `{file:...}` references into `agent-prompts/`), the 3 local plugin hooks, and 3 MCP server entries (context7, grep_app, websearch) |
| `agent-prompts/` | Raw prompt bodies for the 10 agents (no frontmatter - metadata lives in `opencode.jsonc`) |
| `plugin/` | 4 small local OpenCode plugins (`edit-error-recovery`, `keyword-detector` for the `ultrawork` keyword, `goal` for persistent thread goals + idle auto-continue, `rules-injector` for nested `AGENTS.md` files) |
| `command/` | 4 slash commands (`/goal`, `/handoff`, `/refactor`, `/remove-ai-slops`) |
| `skills/` | 16 skills ported verbatim from the upstream project (git-master, refactor, debugging, frontend, programming, lsp-setup, ast-grep, etc.) |

## The agents

Primary (what you Tab between):

- **Sisyphus - Ultraworker** - main orchestrator, delegates to everything below
- **Prometheus - Plan Builder** - planning consultant, interviews before a plan is built
- **Atlas - Plan Executor** - todo-list-driven executor

Subagents (delegated to via `task()`, not directly selectable):

- **Explore - Codebase Search**, **Librarian - Docs Search** - fast research (Haiku)
- **Metis - Plan Consultant**, **Momus - Plan Critic** - plan review
- **Oracle - Architecture Consult** - hard architecture/debugging consult
- **Multimodal Looker - Vision** - image/PDF analysis
- **Sisyphus-Junior** - focused executor, can only delegate further to Explore/Librarian

All models point at Amazon Bedrock Claude (`amazon-bedrock/...`) - adjust the
`model` field in `opencode.jsonc` per agent if you're on a different provider.

## Installation

This repo is meant to be **symlinked into OpenCode's config directory**, not
copied - so editing a file here immediately affects every OpenCode config
location that links to it (useful if, like this setup, you have more than
one active config path, e.g. via `XDG_CONFIG_HOME`).

```bash
OPENCODE_CONFIG_DIR="$HOME/.config/opencode"   # adjust per machine/location

ln -sfn "$(pwd)/opencode.jsonc"    "$OPENCODE_CONFIG_DIR/opencode.jsonc"
ln -sfn "$(pwd)/agent-prompts"     "$OPENCODE_CONFIG_DIR/agent-prompts"
ln -sfn "$(pwd)/plugin"            "$OPENCODE_CONFIG_DIR/plugin"
ln -sfn "$(pwd)/command"           "$OPENCODE_CONFIG_DIR/command"
ln -sfn "$(pwd)/skills"            "$OPENCODE_CONFIG_DIR/skills"

bun install   # populates this repo's own node_modules
```

The `plugin/*.ts` files import `@opencode-ai/plugin`. Because they're reached
through a symlink, Bun/Node resolve `node_modules` relative to this repo's
*real* path, not the config directory's - so this repo carries its own
`package.json`/lockfile and needs its own `bun install` (`node_modules` is
gitignored, regenerate it after cloning). Skipping this step doesn't error
loudly - it just silently drops any plugin file that does a real (non-type)
import from `@opencode-ai/plugin`, currently only `goal.ts` (its `tool()`
helper needs the real module; the other 3 plugins only import the `Plugin`
*type*, which is erased at compile time and doesn't need this at all).

After linking (or after any edit to a file in this repo), quit and restart
any running OpenCode session - config is loaded once at startup, not
hot-reloaded.

## Usage

- Type `ultrawork` or `ulw` anywhere in a message to Sisyphus for the
  stricter certainty + delegation protocol.
- `/goal <objective>` sets a persistent thread goal that auto-continues the
  session when it goes idle, until you (or the agent) call `/goal complete`.
  `/goal status` / `pause` / `resume` / `clear` manage it.
- `/refactor`, `/remove-ai-slops`, `/handoff` - see `command/*.md`.
- Skills auto-load based on their `description` matching what you're doing -
  no manual invocation needed.

## Known limitations vs. upstream

Deliberately not ported (see project history for why): the
`todo-continuation-enforcer` autonomy engine, the hashline hash-tagged edit
protocol, cross-provider model-fallback chains, Team Mode and everything
gated behind it (including `/hyperplan`), the custom `lsp`/`codegraph` MCP
servers (use OpenCode's native LSP config + the `lsp-setup` skill instead),
and Hephaestus (hard-blocked for non-GPT models by the original plugin's own
code, so not applicable to a Claude-only setup).

Subagents cannot be hidden from OpenCode's `Tab` agent-switcher without
breaking their availability to `task()` delegation - this is a limitation of
this OpenCode version's agent registry, not something this repo can work
around. They'll always be visible when tabbing, alongside the 3 primaries.
