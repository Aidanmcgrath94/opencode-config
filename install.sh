#!/usr/bin/env bash
#
# GoonSquad installer
# --------------------
# Symlinks this repo's agent config into your OpenCode config directory and
# installs the single plugin dependency (@opencode-ai/plugin).
#
# Works two ways:
#   1. One-liner (self-cloning) - no manual git clone needed:
#        curl -fsSL https://raw.githubusercontent.com/<you>/goon-squad/main/install.sh | bash
#      When run via a pipe (no local repo), it clones the repo to
#      ~/.goon-squad (override with GOONSQUAD_DIR) and installs from there.
#   2. From a local checkout:
#        git clone https://github.com/<you>/goon-squad.git && cd goon-squad && ./install.sh
#
# Non-destructive: if you already have a real file/dir where a link would go,
# it is backed up to <name>.bak-<timestamp> before the symlink is created.
# Re-running is safe (idempotent) - existing correct links are left as-is.
#
# Usage:
#   ./install.sh                 # install into $XDG_CONFIG_HOME/opencode (or ~/.config/opencode)
#   OPENCODE_CONFIG_DIR=/path ./install.sh   # install into a custom config dir
#   GOONSQUAD_DIR=/path ./install.sh         # where to clone to (one-liner mode)
#   GOONSQUAD_REPO=<url> ./install.sh        # override the repo URL (one-liner mode)
#   ./install.sh --uninstall     # remove the symlinks this script created
#
set -euo pipefail

# --- config knobs (overridable via env) ---
GOONSQUAD_REPO="${GOONSQUAD_REPO:-https://github.com/aidanmcgrath/goon-squad.git}"
GOONSQUAD_DIR="${GOONSQUAD_DIR:-$HOME/.goon-squad}"

# items to link: source name under REPO_DIR == target name under CONFIG_DIR
ITEMS=(opencode.jsonc agent-prompts plugin command skills)

info() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m!!\033[0m  %s\n' "$*"; }
ok()   { printf '\033[1;32m ✓\033[0m  %s\n' "$*"; }
err()  { printf '\033[1;31mxx\033[0m  %s\n' "$*" >&2; }

# --- resolve the repo's real directory ---
# Two cases:
#   (a) run from a checkout: BASH_SOURCE points at a real file on disk.
#   (b) piped from curl: BASH_SOURCE is not a readable file -> self-clone.
resolve_repo_dir() {
  local source="${BASH_SOURCE[0]:-}"

  # Case (b): piped (no readable source file) -> clone and use that.
  if [ -z "$source" ] || [ ! -f "$source" ]; then
    if ! command -v git >/dev/null 2>&1; then
      err "git not found on PATH - required to clone GoonSquad. Install git and retry."
      exit 1
    fi
    if [ -d "$GOONSQUAD_DIR/.git" ]; then
      info "Updating existing clone at $GOONSQUAD_DIR"
      git -C "$GOONSQUAD_DIR" pull --ff-only || warn "git pull failed - using existing checkout as-is"
    else
      info "Cloning $GOONSQUAD_REPO -> $GOONSQUAD_DIR"
      git clone --depth 1 "$GOONSQUAD_REPO" "$GOONSQUAD_DIR"
    fi
    REPO_DIR="$GOONSQUAD_DIR"
    return
  fi

  # Case (a): resolve real dir, following symlinks.
  while [ -h "$source" ]; do
    local dir
    dir="$(cd -P "$(dirname "$source")" >/dev/null 2>&1 && pwd)"
    source="$(readlink "$source")"
    [[ $source != /* ]] && source="$dir/$source"
  done
  REPO_DIR="$(cd -P "$(dirname "$source")" >/dev/null 2>&1 && pwd)"
}

# --- target config dir ---
CONFIG_DIR="${OPENCODE_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}"

uninstall() {
  # In uninstall mode we still need REPO_DIR to know which links are ours.
  resolve_repo_dir
  info "Removing GoonSquad symlinks from $CONFIG_DIR"
  for item in "${ITEMS[@]}"; do
    local target="$CONFIG_DIR/$item"
    if [ -L "$target" ] && [ "$(readlink "$target")" = "$REPO_DIR/$item" ]; then
      rm "$target"
      ok "unlinked $item"
    else
      warn "skipped $item (not a GoonSquad symlink)"
    fi
  done
  info "Done. Restart OpenCode."
  exit 0
}

[ "${1:-}" = "--uninstall" ] && uninstall

# --- preflight ---
if ! command -v bun >/dev/null 2>&1; then
  warn "bun not found on PATH. Install it first: https://bun.sh"
  warn "  curl -fsSL https://bun.sh/install | bash"
  exit 1
fi

resolve_repo_dir

info "Repo:   $REPO_DIR"
info "Config: $CONFIG_DIR"
mkdir -p "$CONFIG_DIR"

TS="$(date +%Y%m%d-%H%M%S)"

# --- link each item, backing up anything real that's in the way ---
for item in "${ITEMS[@]}"; do
  src="$REPO_DIR/$item"
  target="$CONFIG_DIR/$item"

  if [ ! -e "$src" ]; then
    warn "source missing, skipping: $src"
    continue
  fi

  # already the correct link? leave it.
  if [ -L "$target" ] && [ "$(readlink "$target")" = "$src" ]; then
    ok "$item already linked"
    continue
  fi

  # a stale symlink (points elsewhere) - just replace it, no backup needed.
  if [ -L "$target" ]; then
    rm "$target"
  # a REAL file/dir exists - back it up so we never clobber the user's config.
  elif [ -e "$target" ]; then
    mv "$target" "$target.bak-$TS"
    warn "backed up existing $item -> $item.bak-$TS"
  fi

  ln -s "$src" "$target"
  ok "linked $item"
done

# --- plugin dependency (@opencode-ai/plugin) ---
info "Installing plugin dependency (bun install)"
( cd "$REPO_DIR" && bun install )
ok "dependencies installed"

echo
info "Installed. Restart OpenCode - config is loaded once at startup, not hot-reloaded."
info "Models default to Amazon Bedrock Claude. On another provider, edit the"
info "'model' fields in $REPO_DIR/opencode.jsonc (see README > Using a different provider)."
