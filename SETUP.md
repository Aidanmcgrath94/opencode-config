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

```sh
git clone git@github.com:Aidanmcgrath94/opencode-config.git ~/.config/opencode
```

> If `~/.config/opencode` already exists, back it up first:
> `mv ~/.config/opencode ~/.config/opencode.bak`

---

## 3. Install Plugin Dependencies

The config includes custom plugins that depend on `@opencode-ai/plugin`. Install it:

```sh
cd ~/.config/opencode
bun install
# or: npm install
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

## 6. Optional: Machine-Specific MCP Servers

The base config gives you 4 universal MCP servers (context7, grep_app, websearch, playwright). If you also want `ssh-mcp`, `dan_mcp`, and the GitHub MCP remote server, follow these steps.

### 6a. Install ssh-mcp

Download or build the `ssh-mcp` binary and place it at `~/.local/bin/ssh-mcp`:

```sh
mkdir -p ~/.local/bin
# Download the binary from https://github.com/slepp/ssh-mcp (or your source)
# and move it to:
mv /path/to/ssh-mcp ~/.local/bin/ssh-mcp
chmod +x ~/.local/bin/ssh-mcp
```

### 6b. Check out dan-mcp

```sh
mkdir -p ~/code
git clone <dan-mcp-repo-url> ~/code/dan-mcp
```

### 6c. Install uv

`dan_mcp` is run via `uv`:

```sh
brew install uv
```

### 6d. Create opencode.local.jsonc

Create `~/.config/opencode/opencode.local.jsonc` with the following content. Replace all `<...>` placeholders with the actual absolute paths on your machine (use `which uv`, `which ssh-mcp` / `echo ~/.local/bin/ssh-mcp`, etc.):

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "ssh-mcp": {
      "type": "local",
      "command": ["<absolute-path-to-ssh-mcp-binary>"],
      "enabled": true,
      "timeout": 30000
    },
    "dan_mcp": {
      "type": "local",
      "command": ["<absolute-path-to-uv>", "run", "--directory", "<path-to-dan-mcp-repo>", "dan-mcp"],
      "enabled": true,
      "timeout": 30000
    },
    "github": {
      "type": "remote",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer {env:GITHUB_PERSONAL_ACCESS_TOKEN}",
        "X-MCP-Toolsets": "repos,issues,pull_requests"
      },
      "oauth": false,
      "enabled": true
    }
  }
}
```

**Example filled-in values** (substitute your actual paths):

| Placeholder | Example value |
|---|---|
| `<absolute-path-to-ssh-mcp-binary>` | `/home/<your-username>/.local/bin/ssh-mcp` |
| `<absolute-path-to-uv>` | `/opt/homebrew/bin/uv` (run `which uv`) |
| `<path-to-dan-mcp-repo>` | `/home/<your-username>/code/dan-mcp` |

> `opencode.local.jsonc` is git-ignored — it will never be committed. Safe to put machine-specific absolute paths here.

### 6e. Point opencode at the local config

Add to `~/.zshrc`:

```sh
export OPENCODE_CONFIG=~/.config/opencode/opencode.local.jsonc
```

Then reload:

```sh
source ~/.zshrc
```

---

## 7. Verify

Launch opencode:

```sh
opencode
```

**What you should see:**

| Setup | MCP Servers | Agents |
|---|---|---|
| Base (steps 1–5) | 4 (context7, grep_app, websearch, playwright) | 12 |
| With optional override (step 6) | 6 (+ ssh-mcp, dan_mcp / github) | 12 |

All 12 agents should be available regardless: Prometheus, Atlas, Oracle, Sisyphus, Daedalus, and the rest of the squad.

If an MCP server fails to connect, check:
- The binary path in `opencode.local.jsonc` is correct and executable
- `GITHUB_PERSONAL_ACCESS_TOKEN` is set in your current shell (`echo $GITHUB_PERSONAL_ACCESS_TOKEN`)
- `uv` is on your PATH (`which uv`)

---

## Quick Reference

```
~/.config/opencode/          ← cloned from git (agents, skills, plugins, base MCP)
~/.config/opencode/opencode.local.jsonc  ← git-ignored, machine-specific MCP overrides
~/.local/share/opencode/     ← auth tokens (not synced, per-device)
~/.local/bin/ssh-mcp         ← ssh-mcp binary
~/code/dan-mcp/              ← dan-mcp repo
```
