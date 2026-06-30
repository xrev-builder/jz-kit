#!/usr/bin/env bash
# Install mgp-claude-kit into ~/.claude so the skills and swarm workflows
# are available to Claude Code on this machine.
#
# Usage:
#   ./install.sh            # symlink (default) — edits in the repo take effect live
#   ./install.sh --copy     # copy instead of symlink
#
# Safe to re-run. Existing files at the targets are backed up to <name>.bak.

set -euo pipefail

MODE="symlink"
[[ "${1:-}" == "--copy" ]] && MODE="copy"

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="${CLAUDE_HOME:-$HOME/.claude}"
SKILLS_DST="$CLAUDE_DIR/skills"
WORKFLOWS_DST="$CLAUDE_DIR/workflows"

mkdir -p "$SKILLS_DST" "$WORKFLOWS_DST"

link_one() {
  local src="$1" dst="$2"
  if [[ -e "$dst" || -L "$dst" ]]; then
    mv "$dst" "$dst.bak"
    echo "  backed up existing -> $(basename "$dst").bak"
  fi
  if [[ "$MODE" == "copy" ]]; then
    cp -R "$src" "$dst"; echo "  copied  $(basename "$dst")"
  else
    ln -s "$src" "$dst"; echo "  linked  $(basename "$dst")"
  fi
}

echo "Installing skills into $SKILLS_DST ($MODE):"
for d in "$REPO_DIR"/skills/*/; do
  link_one "${d%/}" "$SKILLS_DST/$(basename "$d")"
done

echo "Installing workflows into $WORKFLOWS_DST ($MODE):"
for f in "$REPO_DIR"/workflows/*.js; do
  link_one "$f" "$WORKFLOWS_DST/$(basename "$f")"
done

echo
echo "Done. Restart Claude Code (or start a new session) to pick up the skills."
echo "perfect-loop expects the workflow scripts at ~/.claude/workflows/ — now in place."
