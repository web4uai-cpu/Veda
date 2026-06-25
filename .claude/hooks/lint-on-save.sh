#!/bin/bash
# VEDA Lint-on-Save Hook
# Triggered when files are saved to auto-fix formatting issues

FILE="$1"

if [ -z "$FILE" ]; then
  echo "Usage: lint-on-save.sh <file-path>"
  exit 1
fi

EXTENSION="${FILE##*.}"

case "$EXTENSION" in
  ts|tsx|js|jsx)
    echo "Auto-fixing: $FILE"
    npx eslint --fix "$FILE" 2>/dev/null
    npx prettier --write "$FILE" 2>/dev/null
    ;;
  py)
    echo "Auto-fixing: $FILE"
    python -m ruff format "$FILE" 2>/dev/null
    python -m ruff check --fix "$FILE" 2>/dev/null
    ;;
  css)
    echo "Auto-fixing: $FILE"
    npx prettier --write "$FILE" 2>/dev/null
    ;;
  json)
    echo "Auto-fixing: $FILE"
    npx prettier --write "$FILE" 2>/dev/null
    ;;
esac
