# GoonSquad

A squad of specialized Claude agents for [OpenCode](https://opencode.ai) -
planners, executors, researchers, and reviewers wired together with skills,
slash commands, and a few local plugin hooks. Runs on plain OpenCode native
primitives with **zero third-party plugin dependency**.

Personal, standalone re-implementation of the useful parts of
[`oh-my-openagent`](https://github.com/code-yeongyu/oh-my-openagent).

> **License note**: `oh-my-openagent` is under the Sustainable Use License
> (SUL-1.0), which permits personal, non-commercial derivatives. This repo is
> exactly that. Original: <https://github.com/code-yeongyu/oh-my-openagent>.

---

## Quick start

One line (needs `git` + `npm` or [bun](https://bun.sh)):

```bash
curl -fsSL https://raw.githubusercontent.com/aidanmcgrath/goon-squad/main/install.sh | bash
```

That clones the repo to `~/.goon-squad`, symlinks the config into your OpenCode
config dir (non-destructively), and runs `npm install`. Then:

1. **Restart OpenCode** - config loads once at startup.
2. **Start working**. You land on **Sisyphus** by default. Just describe what
   you want. `Tab` switches between the four primary agents.

> Not on AWS Bedrock? See [Using a different provider](#using-a-different-provider)
> before you start - the default models are Bedrock Claude.

```
"Add a /health endpoint that returns 200 and the git SHA"   → Sisyphus does it
"Plan how we'd migrate this service off Redis"              → Tab to Prometheus
"Execute .gs/plans/redis-migration.md"                     → Tab to Atlas
```

That's the whole loop: **plan → execute**, or just **ask Sisyphus** for
anything self-contained.

---

## How to drive the squad

You only ever pick between **four primary agents** (via `Tab`). Everything
else happens automatically - the primaries delegate to specialist subagents
behind the scenes.

| You want to… | Use | Why |
|---|---|---|
| Get a self-contained task done now | **Sisyphus** (default) | Does the work, delegates as needed |
| Figure out *how* to build something fuzzy/large | **Prometheus** | Interviews you, writes a concrete plan |
| Grind through an existing plan/todo list end-to-end | **Atlas** | Runs every task in parallel, verifies |

**Recommended workflow:**

```
fuzzy / large ─▶ Prometheus (plan) ─▶ .gs/plans/plan.md ─▶ Atlas (execute) ─▶ done
clear / direct ─▶ Sisyphus  (add `ulw` for strict mode) ────────────────────▶ done
just need answers ─▶ Sisyphus/Prometheus auto-research via Explore + Librarian
```

**Tips that matter in practice:**

- Type **`ultrawork`** or **`ulw`** anywhere in a message to Sisyphus for a
  stricter certainty + delegation protocol (heavier, more thorough).
- Run **`/goal <objective>`** to set a persistent goal - the session
  auto-continues when it goes idle until the goal is done. Manage with
  `/goal status | pause | resume | clear | complete`.
- **Skills load automatically** based on what you're doing (e.g. touching
  `.py`/`.ts`/`.rs` loads coding rules; UI work loads the frontend skill). No
  manual invocation.
- Subagents (Explore, Oracle, etc.) also show up in the `Tab` switcher, but you
  normally **don't select them directly** - the primaries call them for you.

---

## The agents

Full per-agent docs (remit, model, tools, structure diagram, usage) live in
[`docs/<agent>/info.md`](docs/):

**Primary** (you `Tab` between these):

| Agent | Role | Docs |
|---|---|---|
| Sisyphus - Ultraworker | Default orchestrator; does + delegates | [info](docs/sisyphus/info.md) |
| Prometheus - Plan Builder | Writes decision-complete plans (never implements) | [info](docs/prometheus/info.md) |
| Atlas - Plan Executor | Runs a plan/todo list to completion | [info](docs/atlas/info.md) |
| Daedalus - Problem Explorer | Explores/frames a problem before planning; hands off to Prometheus | [info](docs/daedalus/info.md) |

**Subagents** (delegated to automatically):

| Agent | Role | Docs |
|---|---|---|
| Explore - Codebase Search | Find code in *this* repo | [info](docs/explore/info.md) |
| Librarian - Docs Search | External docs, OSS source, library internals | [info](docs/librarian/info.md) |
| Oracle - Architecture Consult | Hard architecture & debugging advice | [info](docs/oracle/info.md) |
| Metis - Plan Consultant | Pre-plan analysis of hidden intent/ambiguity | [info](docs/metis/info.md) |
| Momus - Plan Critic | Reviews a plan for executability | [info](docs/momus/info.md) |
| Multimodal Looker - Vision | Reads PDFs / images / diagrams | [info](docs/multimodal-looker/info.md) |
| Sisyphus-Junior | Focused code executor (leaf node) | [info](docs/sisyphus-junior/info.md) |
| Hermes - PR & GitHub Delivery | Owns the PR lifecycle (create/merge) + GitHub via MCP; defers local git to git-master | [info](docs/hermes/info.md) |
| Nemesis - Security Reviewer | Read-only code security audit; PASS/FAIL verdict on a diff | [info](docs/nemesis/info.md) |

```
                                you (Tab to switch)
                                       │
        ┌──────────────┬───────────────┼───────────────┬──────────────┐
        ▼              ▼               ▼               ▼              ▼
   PROMETHEUS      DAEDALUS        SISYPHUS          ATLAS
   (plan builder) (problem        (ultraworker)   (plan executor)
                   explorer)
        │              │               │               │
        └──────────────┴─ all delegate via task() ─────┴──────────────┘
                                       │
   ┌──────────┬──────────┬──────────┬──┴───────┬──────────┬────────────┐
   ▼          ▼          ▼          ▼          ▼          ▼            ▼
 Explore   Librarian   Oracle     Metis      Momus     Multimodal   Sisyphus
 (find      (docs +    (hard arch/ (pre-plan  (plan      Looker      -Junior
  code)      OSS)       debug)      analysis)  critic)   (vision)    (executor)
   │
   ├─ Hermes  (PR & GitHub delivery — gh pr create/merge via github MCP)
   └─ Nemesis (security reviewer — PASS/FAIL verdict on a diff)
```

> All models point at Amazon Bedrock Claude (`amazon-bedrock/...`). On a
> different provider, see [Using a different provider](#using-a-different-provider).

---

## Commands, keywords & skills

**Slash commands** (`command/*.md`):

| Command | What it does |
|---|---|
| `/goal <objective>` | Set a persistent thread goal + idle auto-continue (`status`/`pause`/`resume`/`clear`/`complete`) |
| `/handoff` | Produce a handoff summary of the current session |
| `/refactor` | Guided refactor workflow |
| `/remove-ai-slops` | Strip AI-generated code smells from recent changes |

**Keyword:** `ultrawork` / `ulw` in any message → Sisyphus's strict mode.

**Skills** (17, in `skills/`, auto-loaded by description match): git-master,
refactor, debugging, frontend, programming, lsp-setup, ast-grep, visual-qa,
review-work, ulw-plan, ulw-research, ultimate-browsing, start-work,
remove-ai-slops, coding-agent-sessions, init-deep, explore-solve.

---

## Installation

**Requires `git` and `npm`** (or [bun](https://bun.sh) as an alternative).

**One-liner (self-cloning)** - no manual clone needed:

```bash
curl -fsSL https://raw.githubusercontent.com/aidanmcgrath/goon-squad/main/install.sh | bash
```

Clones to `~/.goon-squad` (override with `GOONSQUAD_DIR=/path`), then symlinks
and installs. Re-running updates the clone (`git pull`) and re-links.

**From a local checkout:**

```bash
git clone https://github.com/aidanmcgrath/goon-squad.git
cd goon-squad
./install.sh
```

`install.sh` symlinks the config into `$XDG_CONFIG_HOME/opencode` (or
`~/.config/opencode`) and runs `npm install`. It's **non-destructive** - if you
already have a real file where a link would go (e.g. an existing
`opencode.jsonc`), it's backed up to `<name>.bak-<timestamp>` first. Re-running
is safe.

```bash
OPENCODE_CONFIG_DIR=/custom/path ./install.sh   # install to a custom config dir
GOONSQUAD_DIR=/custom/clone ./install.sh        # where to clone (one-liner mode)
GOONSQUAD_REPO=<git-url> ./install.sh           # install from a fork
./install.sh --uninstall                        # remove GoonSquad's symlinks
```

> `--uninstall` removes only the symlinks it created; any `*.bak-*` backup of
> your previous config is left in place for you to restore manually.

<details>
<summary>Manual install (no script)</summary>

```bash
OPENCODE_CONFIG_DIR="$HOME/.config/opencode"   # adjust per machine

ln -sfn "$(pwd)/opencode.jsonc"  "$OPENCODE_CONFIG_DIR/opencode.jsonc"
ln -sfn "$(pwd)/agent-prompts"   "$OPENCODE_CONFIG_DIR/agent-prompts"
ln -sfn "$(pwd)/plugin"          "$OPENCODE_CONFIG_DIR/plugin"
ln -sfn "$(pwd)/command"         "$OPENCODE_CONFIG_DIR/command"
ln -sfn "$(pwd)/skills"          "$OPENCODE_CONFIG_DIR/skills"

npm install
```
</details>

**Why `npm install` is required.** Symlinked plugins resolve `node_modules`
against this repo's *real* path, not the config dir. The single dependency is
`@opencode-ai/plugin`. Skipping the install silently drops `goal.ts` (the only
plugin with a real runtime import - `tool`; the other three import the `Plugin`
type only, which is erased at compile time).

**Restart OpenCode** after installing or after any edit here - config is loaded
once at startup, not hot-reloaded.

---

## Using a different provider

Every agent's `model` field in [`opencode.jsonc`](opencode.jsonc) points at
Amazon Bedrock Claude (`amazon-bedrock/...`). If you're on Bedrock, there's
nothing to do. On any other provider, edit the three model tiers - the config
uses exactly three distinct models:

| Tier | Used by | Default (Bedrock) |
|---|---|---|
| **Opus** (heavy reasoning) | Sisyphus, Prometheus, Daedalus, Momus, Oracle, Nemesis | `amazon-bedrock/us.anthropic.claude-opus-4-8` |
| **Sonnet** (balanced) | Atlas, Metis, Multimodal Looker, Sisyphus-Junior, Hermes | `amazon-bedrock/us.anthropic.claude-sonnet-4-6` |
| **Haiku** (fast/cheap) | Explore, Librarian | `amazon-bedrock/anthropic.claude-haiku-4-5-20251001-v1:0` |

Find-and-replace each provider-prefixed model ID with your provider's
equivalent - the format is `provider/model` (e.g. `anthropic/claude-opus-4-5`,
`openai/gpt-4o`, `openrouter/anthropic/claude-sonnet-4-5`). For example, to move everything to
Anthropic direct:

```bash
sed -i '' \
  -e 's#amazon-bedrock/us.anthropic.claude-opus-4-8#anthropic/claude-opus-4-5#g' \
  -e 's#amazon-bedrock/us.anthropic.claude-sonnet-4-6#anthropic/claude-sonnet-4-5#g' \
  -e 's#amazon-bedrock/anthropic.claude-haiku-4-5-20251001-v1:0#anthropic/claude-haiku-4-5#g' \
  opencode.jsonc
```

Make sure the provider is authenticated in OpenCode (`/connect` or the relevant
`*_API_KEY` env var). See OpenCode's [models docs](https://opencode.ai/docs/models).

---

## What's in the repo

| Dir/file | What |
|---|---|
| `install.sh` | Non-destructive installer: symlinks config into OpenCode + runs `bun install` (`--uninstall` to reverse) |
| `opencode.jsonc` | Agent registrations (`{file:...}` → `agent-prompts/`), plugin hooks, MCP servers (context7, grep_app, websearch, playwright — machine-specific servers go in git-ignored `opencode.local.jsonc`) |
| `agent-prompts/` | Raw prompt bodies for the 13 agents (metadata lives in `opencode.jsonc`) |
| `docs/` | Per-agent reference docs (`docs/<agent>/info.md`) |
| `plugin/` | 4 local hooks: `edit-error-recovery`, `keyword-detector` (`ultrawork`), `goal` (persistent goals + idle auto-continue), `rules-injector` (nested `AGENTS.md`) |
| `command/` | 4 slash commands |
| `skills/` | 17 skills, auto-loaded by description match |

---

## Known limitations vs. upstream

Deliberately not ported: the `todo-continuation-enforcer` autonomy engine, the
hashline edit protocol, cross-provider model-fallback chains, Team Mode (and
`/hyperplan`), the custom `lsp`/`codegraph` MCP servers (use OpenCode's native
LSP + the `lsp-setup` skill instead), and Hephaestus (GPT-only upstream).

Subagents can't be hidden from the `Tab` switcher without breaking their
`task()` availability in this OpenCode version, so they appear alongside the
four primaries when switching - just ignore them and stick to Sisyphus /
Prometheus / Atlas / Daedalus.
