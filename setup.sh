#!/usr/bin/env bash
# CLAUDE OS — one-command setup for Linux/macOS/WSL.
# Usage: curl -fsSL <raw-url>/setup.sh | bash
set -e

REPO="${CLAUDE_OS_REPO:-https://github.com/us24saude/cockpit.git}"
DIR="${CLAUDE_OS_DIR:-$HOME/cockpit}"

echo "✦ CLAUDE OS setup"
echo "  repo: $REPO"
echo "  dir:  $DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "✗ Node.js not found. Install from https://nodejs.org and re-run."
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "✗ git not found. Install from https://git-scm.com and re-run."
  exit 1
fi

if [ -d "$DIR/.git" ]; then
  echo "↺ Updating existing checkout…"
  git -C "$DIR" pull --ff-only
else
  echo "⇣ Cloning…"
  git clone "$REPO" "$DIR"
fi

cd "$DIR/dashboard"
echo "⇣ Installing dependencies…"
npm install --legacy-peer-deps

echo "▶ Starting dev server on http://localhost:3005"
npm run dev
