# opencode Config — New Device Setup

Get the "good squad" config (12 agents, 17 skills, 4 plugins, MCP servers) running on a fresh machine in under 10 minutes.

---

## 1. Prerequisites

Install **opencode**:

```sh
# via npm (or bun)
npm install -g opencode-ai
# or
bun install -g opencode-ai
```

Install **bun** (preferred JS runtime for plugins):

```sh
curl -fsSL https://bun.sh/install | bash
```

Or use `npm` if you prefer — both work for the plugin install step.

---

## 2. Clone the Config

If `~/.config/opencode` already exists, back it up first — then clone into the now-empty path:

```sh
# Back up any existing config (keeps your auth tokens etc. safe in the .bak)
mv ~/.config/opencode ~/.config/opencode.bak

# Clone the squad config
git clone git@github.com:Aidanmcgrath94/opencode-config.git ~/.config/opencode
```

> **Auth tokens are safe** — they live in `~/.local/share/opencode/`, not `~/.config/opencode/`, so the backup step is just for any custom local config you had, not your credentials.

If you had anything worth keeping in the old config (custom agents, local settings), check `~/.config/opencode.bak` and merge what you need into the new clone.

---

## 3. Install Plugin Dependencies

The config includes custom plugins that depend on `@opencode-ai/plugin`. Install it:

```sh
cd ~/.config/opencode
npm install
# or if you have bun: bun install
```

This reads `package.json` in the config directory and installs the required packages locally. Without this step the plugins will fail to load.

---

## 4. Re-authenticate opencode

Auth credentials live in `~/.local/share/opencode/` and are **not** synced via git — every new device needs its own auth.

Launch opencode and follow the provider auth flow:

```sh
opencode
```

### AWS Bedrock

Bedrock uses your AWS credentials (not an opencode-specific token). Make sure your AWS credentials are configured:

```sh
aws configure
# or set env vars:
export AWS_ACCESS_KEY_ID=<your-access-key>
export AWS_SECRET_ACCESS_KEY=<your-secret-key>
export AWS_DEFAULT_REGION=us-east-1
```

### API Key Providers (Anthropic, OpenAI, etc.)

For direct API key providers, opencode will prompt you on first run. You can also set them as environment variables:

```sh
export ANTHROPIC_API_KEY=<your-api-key>
export OPENAI_API_KEY=<your-api-key>
```

Add whichever you use to `~/.zshrc` (or `~/.zprofile`) so they persist across sessions.

---

## 5. Set GitHub MCP Token

The GitHub MCP server requires a Personal Access Token. Add this to `~/.zshrc` (or `~/.zprofile`):

```sh
export GITHUB_PERSONAL_ACCESS_TOKEN=<your-github-pat>
```

Then reload your shell:

```sh
source ~/.zshrc
```

**How to generate a PAT:** GitHub → Settings → Developer settings → Personal access tokens → Generate new token. Grant `repo`, `issues`, and `pull_requests` scopes at minimum.

> This token is used by the `github` MCP server to read/write repos, issues, and PRs on your behalf.

---

## 6. Verify

Launch opencode:

```sh
opencode
```

**What you should see:**

| Setup | MCP Servers | Agents |
|---|---|---|
| Base (steps 1–5) | 4 (context7, grep_app, websearch, playwright) | 12 |

All 12 agents should be available: Prometheus, Atlas, Oracle, Sisyphus, Daedalus, and the rest of the squad.

If an MCP server fails to connect, check:
- `GITHUB_PERSONAL_ACCESS_TOKEN` is set in your current shell (`echo $GITHUB_PERSONAL_ACCESS_TOKEN`)

---

## Quick Reference

```
~/.config/opencode/          ← cloned from git (agents, skills, plugins, MCP config)
~/.local/share/opencode/     ← auth tokens (not synced, per-device)
```
