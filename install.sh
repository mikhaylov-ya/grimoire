#!/usr/bin/env bash
# Symlink every skill in ./skills into the Claude Code skills directory.
# Usage: ./install.sh [--force]
#   --force  back up (to <name>.bak) any existing non-symlink skill dir before linking
set -euo pipefail

repo="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
target="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
force=0
[[ "${1:-}" == "--force" ]] && force=1

mkdir -p "$target"

for src in "$repo"/skills/*/; do
  name="$(basename "$src")"
  dest="$target/$name"

  if [[ -L "$dest" ]]; then
    rm "$dest"
  elif [[ -e "$dest" ]]; then
    if (( force )); then
      mv "$dest" "$dest.bak"
      echo "backed up $dest -> $dest.bak"
    else
      echo "skip $name: $dest exists and is not a symlink (rerun with --force)" >&2
      continue
    fi
  fi

  ln -s "${src%/}" "$dest"
  echo "linked $name"
done
